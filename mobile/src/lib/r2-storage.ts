import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { getRandomBytes } from 'expo-random';
import { decode as atobPolyfill } from 'base-64';

// Ensure crypto.getRandomValues exists (needed by AWS SDK on React Native)
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = {};
}
if (typeof globalThis.crypto.getRandomValues !== 'function') {
  (globalThis.crypto as any).getRandomValues = (array: Uint8Array) => {
    const randomBytes = getRandomBytes(array.length);
    array.set(randomBytes);
    return array;
  };
}

// Ensure atob exists in all environments
if (typeof globalThis.atob !== 'function') {
  (globalThis as any).atob = atobPolyfill;
}

// Cloudflare R2 Configuration
const R2_CONFIG = {
  accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID,
  accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  bucketName: process.env.EXPO_PUBLIC_R2_BUCKET_NAME,
  publicUrl: process.env.EXPO_PUBLIC_R2_PUBLIC_URL,
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
};

// Create S3 client configured for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_CONFIG.endpoint,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId || '',
    secretAccessKey: R2_CONFIG.secretAccessKey || '',
  },
});

async function compressImage(uri: string, maxWidth = 1200, quality = 0.8): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

async function getImageBytes(uri: string): Promise<Uint8Array> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Unable to read image: ${response.status}`);
    }
    const blob = await response.blob();
    if (typeof blob.arrayBuffer === 'function') {
      return new Uint8Array(await blob.arrayBuffer());
    }

    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    return new Uint8Array(arrayBuffer);
  }

  const { readAsStringAsync } = await import('expo-file-system/legacy');
  const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
  const binaryString = (globalThis.atob as (data: string) => string)(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Upload an image to Cloudflare R2
 * @param imageUri - The local URI of the image (from image picker)
 * @param folder - The folder/prefix in the bucket (e.g., 'pets', 'activities', 'profiles')
 * @param compress - Whether to compress the image before upload (defaults to false for reliability)
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToR2(
  imageUri: string,
  folder: 'pets' | 'activities' | 'profiles',
  compress = false
): Promise<string> {
  try {
    const uriToUpload = compress && Platform.OS !== 'web' ? await compressImage(imageUri) : imageUri;
    const bytes = await getImageBytes(uriToUpload);

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${folder}/${timestamp}-${randomString}.jpg`;

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: fileName,
      Body: bytes,
      ContentType: 'image/jpeg',
    });

    await r2Client.send(command);
    return `${R2_CONFIG.publicUrl}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  try {
    const key = imageUrl.replace(`${R2_CONFIG.publicUrl}/`, '');

    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete image');
  }
}

export async function uploadMultipleImagesToR2(
  imageUris: string[],
  folder: 'pets' | 'activities' | 'profiles',
  compress = false
): Promise<string[]> {
  const uploadPromises = imageUris.map((uri) => uploadImageToR2(uri, folder, compress));
  return Promise.all(uploadPromises);
}

export function isR2Configured(): boolean {
  return !!(
    R2_CONFIG.accountId &&
    R2_CONFIG.accessKeyId &&
    R2_CONFIG.secretAccessKey &&
    R2_CONFIG.bucketName &&
    R2_CONFIG.publicUrl &&
    R2_CONFIG.endpoint
  );
}


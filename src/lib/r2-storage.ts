import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Cloudflare R2 Configuration
const R2_CONFIG = {
  accountId: import.meta.env.VITE_R2_ACCOUNT_ID,
  accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  bucketName: import.meta.env.VITE_R2_BUCKET_NAME,
  publicUrl: import.meta.env.VITE_R2_PUBLIC_URL,
  endpoint: import.meta.env.VITE_R2_ENDPOINT,
};

// Create S3 client configured for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_CONFIG.endpoint,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

/**
 * Compress and resize image before upload
 */
async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload an image to Cloudflare R2
 * @param file - The image file to upload
 * @param folder - The folder/prefix in the bucket (e.g., 'pets', 'activities', 'profiles')
 * @param compress - Whether to compress the image before upload
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToR2(
  file: File,
  folder: 'pets' | 'activities' | 'profiles',
  compress = true
): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Compress image if requested
    const fileToUpload = compress ? await compressImage(file) : file;

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Upload to R2
    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: R2_CONFIG.bucketName,
        Key: fileName,
        Body: fileToUpload,
        ContentType: file.type,
      },
    });

    await upload.done();

    // Return public URL
    return `${R2_CONFIG.publicUrl}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Cloudflare R2
 * @param imageUrl - The full public URL of the image
 */
export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  try {
    // Extract the key from the URL
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

/**
 * Upload multiple images to R2
 * @param files - Array of image files
 * @param folder - The folder/prefix in the bucket
 * @param compress - Whether to compress images before upload
 * @returns Array of public URLs
 */
export async function uploadMultipleImagesToR2(
  files: File[],
  folder: 'pets' | 'activities' | 'profiles',
  compress = true
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImageToR2(file, folder, compress));
  return Promise.all(uploadPromises);
}

/**
 * Check if R2 is properly configured
 */
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


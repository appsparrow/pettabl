/**
 * Test R2 Connection
 * Run this to verify your R2 setup is working
 */

import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const R2_CONFIG = {
  accountId: import.meta.env.VITE_R2_ACCOUNT_ID,
  accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  bucketName: import.meta.env.VITE_R2_BUCKET_NAME,
  publicUrl: import.meta.env.VITE_R2_PUBLIC_URL,
  endpoint: import.meta.env.VITE_R2_ENDPOINT,
};

export async function testR2Connection() {
  console.log('🧪 Testing R2 Connection...\n');
  
  // Check if all credentials are present
  const checks = [
    { name: 'Account ID', value: R2_CONFIG.accountId },
    { name: 'Access Key ID', value: R2_CONFIG.accessKeyId },
    { name: 'Secret Access Key', value: R2_CONFIG.secretAccessKey },
    { name: 'Bucket Name', value: R2_CONFIG.bucketName },
    { name: 'Public URL', value: R2_CONFIG.publicUrl },
    { name: 'Endpoint', value: R2_CONFIG.endpoint },
  ];

  console.log('📋 Configuration Check:');
  checks.forEach(({ name, value }) => {
    const status = value ? '✅' : '❌';
    const display = value
      ? name.includes('Secret')
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : value
      : 'NOT SET';
    console.log(`${status} ${name}: ${display}`);
  });

  const allConfigured = checks.every(({ value }) => value);
  
  if (!allConfigured) {
    console.log('\n❌ R2 is not fully configured. Please check your .env file.');
    return false;
  }

  console.log('\n🔌 Testing connection to Cloudflare R2...');

  try {
    const client = new S3Client({
      region: 'auto',
      endpoint: R2_CONFIG.endpoint,
      credentials: {
        accessKeyId: R2_CONFIG.accessKeyId!,
        secretAccessKey: R2_CONFIG.secretAccessKey!,
      },
    });

    // Try to list buckets (this verifies credentials work)
    const command = new ListBucketsCommand({});
    const response = await client.send(command);

    console.log('✅ Successfully connected to Cloudflare R2!');
    console.log(`📦 Found ${response.Buckets?.length || 0} bucket(s)`);
    
    if (response.Buckets && response.Buckets.length > 0) {
      console.log('\n📂 Your buckets:');
      response.Buckets.forEach((bucket) => {
        const isCurrent = bucket.Name === R2_CONFIG.bucketName;
        const marker = isCurrent ? '👈 CURRENT' : '';
        console.log(`   - ${bucket.Name} ${marker}`);
      });
    }

    console.log('\n🎉 R2 is ready to use!');
    console.log('💡 You can now upload images from your app.');
    
    return true;
  } catch (error: any) {
    console.error('\n❌ Failed to connect to R2:');
    console.error(`   ${error.message}`);
    console.log('\n💡 Common issues:');
    console.log('   - Check that your Access Key ID and Secret Access Key are correct');
    console.log('   - Verify the endpoint URL matches your account ID');
    console.log('   - Ensure the API token has Object Read & Write permissions');
    return false;
  }
}

// Add a manual test trigger you can call from console
if (typeof window !== 'undefined') {
  (window as any).testR2 = testR2Connection;
  console.log('💡 Tip: Run testR2() in the browser console to test R2 connection');
}


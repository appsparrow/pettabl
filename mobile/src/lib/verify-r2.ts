/**
 * R2 Configuration Verification Utility (Mobile)
 * Run this to check if R2 is properly configured
 */

import { isR2Configured } from './r2-storage';

export function verifyR2Setup() {
  console.log('🔍 Verifying R2 Configuration (Mobile)...\n');

  const config = {
    accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID,
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
    bucketName: process.env.EXPO_PUBLIC_R2_BUCKET_NAME,
    publicUrl: process.env.EXPO_PUBLIC_R2_PUBLIC_URL,
    endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  };

  const checks = [
    { name: 'R2_ACCOUNT_ID', value: config.accountId, required: true },
    { name: 'R2_ACCESS_KEY_ID', value: config.accessKeyId, required: true },
    { name: 'R2_SECRET_ACCESS_KEY', value: config.secretAccessKey, required: true },
    { name: 'R2_BUCKET_NAME', value: config.bucketName, required: true },
    { name: 'R2_PUBLIC_URL', value: config.publicUrl, required: true },
    { name: 'R2_ENDPOINT', value: config.endpoint, required: true },
  ];

  let allPassed = true;

  checks.forEach(({ name, value, required }) => {
    const status = value ? '✅' : required ? '❌' : '⚠️';
    const display = value
      ? name.includes('SECRET')
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : value
      : 'NOT SET';

    console.log(`${status} EXPO_PUBLIC_${name}: ${display}`);

    if (required && !value) {
      allPassed = false;
    }
  });

  console.log('\n');

  if (allPassed && isR2Configured()) {
    console.log('✅ R2 is properly configured and ready to use!');
    console.log('🎉 You can now upload images to Cloudflare R2\n');
    return true;
  } else {
    console.log('❌ R2 configuration is incomplete');
    console.log('📋 Please add missing values to your mobile/.env file');
    console.log('📚 See R2-SETUP-GUIDE.md for detailed instructions\n');
    return false;
  }
}


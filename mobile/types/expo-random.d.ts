declare module 'expo-random' {
  export function getRandomBytes(size: number): Uint8Array;
}

declare module 'base-64' {
  export function decode(data: string): string;
}

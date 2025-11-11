// Type declarations for web environment
declare global {
  interface Window {
    localStorage: Storage;
  }
  
  // React Native/Expo development mode flag
  const __DEV__: boolean;
}

export {};


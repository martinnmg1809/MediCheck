import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medicheck.app',
  appName: 'MediCheck',
  webDir: 'dist/medicheck/browser',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
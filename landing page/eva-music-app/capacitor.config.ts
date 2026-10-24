export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  [key: string]: any;
}

const config: CapacitorConfig = {
  appId: 'com.evaflow.music',
  appName: 'EVA Music',
  webDir: 'dist'
};

export default config;

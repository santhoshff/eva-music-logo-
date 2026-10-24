import { Capacitor, registerPlugin, type PluginListenerHandle } from '../shims/capacitorCore';

export interface NotificationStatus {
  permission: boolean;
  enabled: boolean;
  channelEnabled: boolean;
  posted?: boolean;
  error?: string;
}

interface EvaMediaPlugin {
  checkNotificationStatus(): Promise<NotificationStatus>;
  requestNotificationPermission(): Promise<NotificationStatus>;
  update(options: { title: string; artist: string; isPlaying: boolean }): Promise<void>;
  hide(): Promise<void>;
  runTest(): Promise<NotificationStatus>;
  addListener(event: 'mediaAction', cb: (data: { action: 'play' | 'pause' | 'next' | 'previous' }) => void): Promise<PluginListenerHandle>;
}

export const EvaMedia = registerPlugin<EvaMediaPlugin>('EvaMedia');
export const isNativeAndroid = () => Capacitor.getPlatform() === 'android';

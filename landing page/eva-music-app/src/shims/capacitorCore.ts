export interface PluginListenerHandle {
  remove: () => Promise<void>;
}

export const Capacitor = {
  getPlatform: (): string => {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.getPlatform) {
      return (window as any).Capacitor.getPlatform();
    }
    return 'web';
  },
  isNativePlatform: (): boolean => {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform) {
      return (window as any).Capacitor.isNativePlatform();
    }
    return false;
  },
  isPluginAvailable: (name: string): boolean => {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable) {
      return (window as any).Capacitor.isPluginAvailable(name);
    }
    return false;
  },
};

export function registerPlugin<T = any>(name: string, _options?: any): T {
  if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.[name]) {
    return (window as any).Capacitor.Plugins[name];
  }

  return new Proxy({} as any, {
    get: (_target, prop) => {
      if (prop === 'addListener') {
        return async () => ({
          remove: async () => {},
        });
      }
      return async () => ({
        permission: false,
        enabled: false,
        channelEnabled: false,
        posted: false,
      });
    },
  });
}

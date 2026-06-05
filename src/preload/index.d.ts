import { ConversionConfig } from './index';

export interface ElectronAPI {
  startConvert: (config: ConversionConfig) => Promise<unknown>;
  selectPaths: (type: 'file' | 'folder' | 'multi') => Promise<string[] | null>;
  selectOutput: () => Promise<string | null>;
  onLog: (callback: (msg: string) => void) => () => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
    electron: ElectronAPI
  }
}
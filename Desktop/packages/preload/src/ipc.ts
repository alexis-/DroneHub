import { ipcRenderer } from "electron";

export async function getLocaleCountryCode(): Promise<string> {
  return ipcRenderer.invoke('get-locale-country-code');
}

export async function getGeoIp(ip: string) {
  return ipcRenderer.invoke('get-geoip', ip);
}

ipcRenderer.on(
  'keyboard-shortcut',
  (_, key: string) => {
    globalThis.dispatchEvent(new CustomEvent('keyboard-shortcut', { detail: key }));
  },
);
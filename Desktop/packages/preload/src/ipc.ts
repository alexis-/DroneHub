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

/**
 * IPC listener for the 'app-closing' event.
 * The main process sends a unique requestId along with the message.
 * This handler calls the viewModelStore.onAppClosing() method and, upon completion,
 * sends a reply back to the main process on a channel named `app-closing-reply-{requestId}`.
 */
ipcRenderer.on('app-closing', async (event, requestId: string) => {
  try {
    globalThis.dispatchEvent(new CustomEvent('app-closing'));
  } catch (error) {
    console.error('Error during app-closing processing in viewModelStore:', error);
  } finally {
    // Send a reply to the main process indicating that app-closing processing is complete.
    ipcRenderer.send(`app-closing-reply-${requestId}`);
  }
});
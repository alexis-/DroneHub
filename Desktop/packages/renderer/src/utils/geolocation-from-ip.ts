import { httpGet } from '@dhlib/utils/http';
import { getGeoIp } from '@vite-electron-builder/preload';
import { Logger } from '@/services/logger.service';
import { AppError } from '@dhlib/models/app-errors';
import type { GetLocationSuccessCallback, GetLocationErrorCallback } from '@/models/interfaces/IGetLocationCallbacks';

interface IPifyResp {
  ip: string;
}

const CONTEXT = 'GeolocationFromIP';

async function getPublicIP(): Promise<string | null> {
  try {
    const resp = await httpGet<IPifyResp>('https://api.ipify.org?format=json');
    return resp?.ip;
  } catch (error) {
    Logger.error(CONTEXT, 'Error fetching public IP', error);
    throw new AppError('Failed to fetch public IP', CONTEXT, error as Error);
  }
}

export default async function getGeolocationFromIp(
  successCallback: GetLocationSuccessCallback,
  errorCallback?: GetLocationErrorCallback | undefined | null,
) {
  try {
    const ip = await getPublicIP();
    
    if (!ip) {
      if (errorCallback)
        errorCallback('No IP address obtained');
      else
        Logger.warn(CONTEXT, 'No IP address obtained');
      return;
    }

    const geo = await getGeoIp(ip);

    if (!geo || !geo.ll) {
      if (errorCallback)
        errorCallback('No geolocation data obtained');
      else
        Logger.warn(CONTEXT, 'No geolocation data obtained', { ip });
      return;
    }

    Logger.info(CONTEXT, 'Geolocation obtained successfully', { 
      lat: geo.ll[0], 
      lng: geo.ll[1] 
    });
    
    successCallback(geo.ll[0], geo.ll[1]);
  } catch (error) {
    if (errorCallback)
      errorCallback(error);
    else
    Logger.error(CONTEXT, 'Failed to get geolocation from IP', error);
  }
}

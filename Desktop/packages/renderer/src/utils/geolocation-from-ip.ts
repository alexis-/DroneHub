import {httpGet} from './http';
import {getGeoIp} from '#preload';
import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';
import type { GetLocationSuccessCallback, GetLocationErrorCallback } from '@/types/geolocation';

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
      Logger.warn(CONTEXT, 'No IP address obtained');
      if (errorCallback) errorCallback();
      return;
    }

    const geo = await getGeoIp(ip);

    if (!geo || !geo.ll) {
      Logger.warn(CONTEXT, 'No geolocation data obtained', { ip });
      if (errorCallback) errorCallback();
      return;
    }

    Logger.info(CONTEXT, 'Geolocation obtained successfully', { 
      lat: geo.ll[0], 
      lng: geo.ll[1] 
    });
    
    successCallback(geo.ll[0], geo.ll[1]);
  } catch (error) {
    Logger.error(CONTEXT, 'Failed to get geolocation from IP', error);
    if (errorCallback) errorCallback();
  }
}

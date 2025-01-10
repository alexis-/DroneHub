import { getLocaleCountryCode } from '#preload';
import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';
import { countries } from '@/utils/data/countries';
import type { GetLocationSuccessCallback, GetLocationErrorCallback } from '@/types/geolocation';

const CONTEXT = 'GeolocationFromLocale';

export default async function getLocationFromLocale(
  successCallback: GetLocationSuccessCallback,
  errorCallback?: GetLocationErrorCallback | undefined | null,
) {
  try {
    const alpha2 = await getLocaleCountryCode();
    const countryData = countries[alpha2.toUpperCase()];

    if (!countryData) {
      throw new AppError(`No location data for country code: ${alpha2}`, CONTEXT);
    }

    Logger.info(CONTEXT, `Location found for country: ${countryData.name}`, {
      lat: countryData.latitude,
      lng: countryData.longitude
    });
    
    successCallback(countryData.latitude, countryData.longitude);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to get location from locale', CONTEXT, error as Error);
  }
}

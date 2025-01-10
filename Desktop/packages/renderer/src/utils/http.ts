import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';

const CONTEXT = 'HttpUtils';

export async function httpGet<T>(url: string, headers?: HeadersInit): Promise<T> {
  try {
    const response = await fetch(url, {headers: headers});

    if (!response.ok) {
      throw new AppError(`HTTP error! Status: ${response.status}`, CONTEXT);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch data', CONTEXT, error as Error);
  }
}

export async function httpOptions(url: string, headers?: HeadersInit): Promise<Response> {
  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: headers,
    });

    if (!response.ok) {
      throw new AppError(`HTTP error! Status: ${response.status}`, CONTEXT);
    }

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to execute OPTIONS request', CONTEXT, error as Error);
  }
}

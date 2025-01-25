export interface GetLocationSuccessCallback {
  (lat: number, lng: number): void;
}

export interface GetLocationErrorCallback {
  (error: Error | string): void;
}

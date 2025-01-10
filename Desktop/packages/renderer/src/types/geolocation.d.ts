export interface GetLocationSuccessCallback {
  (lat: number, lng: number): void;
}

export interface GetLocationErrorCallback {
  (): void;
}

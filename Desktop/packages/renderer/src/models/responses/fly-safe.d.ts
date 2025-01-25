export interface FlySafeResp {
  code: number;
  message: FSMessage;
  data: FSData;
}

export interface FSMessage {
  chinese: string;
  english: string;
}

export interface FSData {
  areas: FSArea[];
  country: string;
  lat: number;
  lng: number;
}

export interface FSArea {
  area_id: number;
  name: string;
  type: number;
  shape: number;
  lat: number;
  lng: number;
  radius: number;
  level: number;
  begin_at: number;
  end_at: number;
  country: string;
  city: string;
  polygon_points: any;
  color: string;
  url: string;
  sub_areas: FSSubArea[];
  description: string;
  height: number;
  address: string;
  data_source: number;
}

export interface FSSubArea {
  color: string;
  height: number;
  level: number;
  lat: number;
  lng: number;
  radius: number;
  polygon_points: number[][][];
  mapShape?: google.maps.Polygon | google.maps.Circle | null;
  shape: number;
} 

export interface FSZone {
  level: number;
  title: string;
  description: string;
  color_hex: string;
  color_r: number;
  color_g: number;
  color_b: number;
  enabled: boolean;
}
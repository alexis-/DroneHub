export const MapConfig = {
  defaultCenter: {
    lat: 59.9139,
    lng: 10.7522,
  },
  defaultZoom: 8,
  markers: {
    project: {
      scale: 0.5,
      anchor: [0.5, 1],
      path: '/src/assets/map-marker-project.png',
    },
    poi: {
      scale: 0.5,
      anchor: [0.5, 1],
      path: '/src/assets/map-marker-new.png',
    },
  },
} as const; 

export const MapIds = {
  Main: 'main',
} as const;

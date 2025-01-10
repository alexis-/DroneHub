<template>
  <div id="map"></div>

  <div class="map-botright-controls-container">
    <v-btn
      size="x-small"
      @click="centerMapWithGeolocation()"
      class="mb-4"
      icon="mdi-crosshairs-gps"
    />

    <v-btn
      size="x-small"
      @click="changeMapZoomLevel(1)"
      class="mb-1"
      icon="mdi-plus"
    />
    <v-btn
      size="x-small"
      @click="changeMapZoomLevel(-1)"
      icon="mdi-minus"
    />
  </div>

  <div class="map-topright-controls-container">
    <v-menu
      open-on-hover
      location="left center"
    >
      <template v-slot:activator="{props}">
        <button
          class="map-style"
          v-bind="props"
        >
          <img :src="mapStyle.img" />
        </button>
      </template>

      <v-list
        class="map-style-list"
        density="compact"
      >
        <v-list-item
          v-for="(ms, index) in mapStyles"
          :title="ms.title"
          :active="mapStyle.id == ms.id"
          :key="index"
          @click="changeMapStyle(ms)"
        >
          <template v-slot:prepend>
            <img
              class="map-style-list-img"
              :src="ms.img"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, inject} from 'vue';

import getLocationFromLocale from '../utils/geolocation-from-locale';
import mapStyles from '@/models/map-styles';

const showSnackbar = inject<(msg: string) => void>('showSnackbar', s => {});

// TODO: Load from config
const defaultCenter: google.maps.LatLngLiteral = {lat: 59.9139, lng: 10.7522};
const defaultZoom = 8;

let apiKey = 'AIzaSyBpxCibmwWECmysAw_rl4QEcNzOiJBqB_c';
let map: google.maps.Map;

let mapStyle: MapStyle = mapStyles[0];

function changeMapStyle(ms: MapStyle) {
  map.setMapTypeId(ms.id);

  if (map.getMapTypeId() === ms.id) {
    emit('update:map-style', (mapStyle = ms));
  }
}

function changeMapZoomLevel(num: number) {
  map.setZoom(map.getZoom()! + num);
}

function centerMapWithGeolocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
      },
      error => {
        console.warn('Error getting geolocation:', error);
        showSnackbar(`Error getting geolocation: ${error.message}`);
        centerMapWithLocale();
      },
    );
  } else {
    console.warn('Geolocation is not supported by this browser.');
    showSnackbar('Geolocation is not supported by this browser.');
    centerMapWithLocale();
  }
}

function centerMapWithLocale() {
  getLocationFromLocale((lat, lng) => {
    map.setCenter({lat, lng});
    console.info('Geolocation set from locale');
  });
}

function initMap() {
  const mapElement = document.getElementById('map');

  if (mapElement) {
    map = new google.maps.Map(mapElement, {
      center: defaultCenter,
      fullscreenControl: false,
      mapTypeControl: false,
      mapTypeId: mapStyle.id,
      rotateControl: true,
      scaleControl: true, // TODO: Customize https://stackoverflow.com/questions/53159975/google-maps-api-get-map-scale-control-value
      styles: [
        {
          featureType: 'all',
          elementType: 'labels',
          stylers: [{visibility: 'on'}],
        },
      ],
      streetViewControl: false,
      zoom: defaultZoom,
      zoomControl: false,
    });

    map.addListener('idle', () => emit('map-idle', map));

    const checkLinkInterval = setInterval(() => {
      const link = document.querySelector(
        'a[title="Open this area in Google Maps (opens a new window)"]',
      );
      const gmnoprint = document.querySelector('div[class="gmnoprint gm-style-cc"]');

      if (link && gmnoprint) {
        clearInterval(checkLinkInterval);
        link.remove();
        gmnoprint.previousSibling?.previousSibling?.remove();
        gmnoprint.previousSibling?.previousSibling?.remove();
        gmnoprint.previousSibling?.previousSibling?.remove();
        gmnoprint.nextSibling?.remove();
        gmnoprint.remove();
      }
    }, 50);

    emit('update:map-style', mapStyle);
    centerMapWithGeolocation();
  } else {
    console.error('Map element not found');
  }
}

onMounted(() => {
  window.initMap = initMap; // attach to window

  const existingScript = document.querySelector(
    'script[src^="https://maps.googleapis.com/maps/api/js"]',
  );
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=geometry`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  } else {
    // If the script is already loaded, directly call initMap
    initMap();
  }
});

// defineExpose({changeMapStyle});
const emit = defineEmits(['update:map-style', 'map-idle']);
</script>

<style lang="scss">
#map {
  width: 100%;
  height: 100%;
  background: var(--color-surface);
  position: relative;
}

.map-controls {
  position: absolute;
  z-index: 10;
  /* ... rest of the styles using the same structure as open-layers-map ... */
}

.map-botright-controls-container {
  position: absolute;
  bottom: 30px;
  right: 15px;
  z-index: 10; /* ensure they are above the map */
  display: flex;
  flex-direction: column;
}

.map-topright-controls-container {
  position: absolute;
  top: 10px;
  right: 15px;
  z-index: 5;
}

button.map-style {
  margin-top: 5px;
  font-size: 0;
}

button.map-style img {
  border: 1px solid #333;
  border-radius: 8px;
  width: 52px;
  height: 52px;
}

.map-style-list {
  display: flex;
  height: 74px !important;
  overflow: hidden !important;
  padding: 0 !important;
  margin-right: var(--spacing-md);
}

.map-style-list > .v-list-item {
  display: block;
  padding-inline: 0 !important;
  padding: var(--spacing-xs) var(--spacing-md) 0 var(--spacing-md) !important;
}

.v-list-item-title {
  font-size: var(--font-size-body-2);
  text-align: center;
}

.map-style-list-img {
  height: 42px;
  max-height: 42px;
  width: 42px;
  max-width: 42px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
</style>

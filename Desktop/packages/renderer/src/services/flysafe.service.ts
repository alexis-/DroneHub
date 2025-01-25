import { Logger } from '@/services/logger.service';
import { AppError } from '@dhlib/models/app-errors';
import { httpGet } from '@dhlib/utils/http';
import type { FSArea, FSSubArea, FlySafeResp } from '@/models/responses/fly-safe';

const CONTEXT = 'FlySafe';
/*
export default class FlySafe {
  private areas: Map<number, FSArea> = new Map<number, FSArea>();

  onMapIdle(map: google.maps.Map) {
    const bounds = map.getBounds();

    if (!bounds) {
      throw new AppError("Unable to obtain map's bounds", CONTEXT);
    }

    // Obtain coordinates
    const newBounds = this.adjustBoundsToFitArea(bounds, map);

    const ne = newBounds.getNorthEast();
    const sw = newBounds.getSouthWest();
    const nw = new google.maps.LatLng(ne.lat(), sw.lng());
    const se = new google.maps.LatLng(sw.lat(), ne.lng());

    // Build url & send request
    const url = `https://flysafe-api.dji.com/api/geo/v3/areas/in_rectangle?ltlat=${nw.lat()}&ltlng=${nw.lng()}&rblat=${se.lat()}&rblng=${se.lng()}&level=0,1,2,3&level_type=0&zones_mode=total&signature=&drone=mavic-mini`;

    Logger.debug(CONTEXT, 'Fetching fly safe zones', { url });
    
    httpGet<FlySafeResp>(url).then(resp => this.handleResponse(resp, map));
  }

  private handleResponse(resp: FlySafeResp, map: google.maps.Map) {
    try {
      this.clearAreas();

      if (!resp.data?.areas) {
        throw new AppError('No areas data in response', CONTEXT);
      }

      Logger.info(CONTEXT, `Processing ${resp.data.areas.length} areas`);

      resp.data.areas.forEach(area => {
        if (this.areas.has(area.area_id)) {
          return;
        }

        area.sub_areas.forEach(subArea => {
          this.createPolygonWithLabel(subArea, map);
        });

        this.areas.set(area.area_id, area);
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to handle fly safe response', CONTEXT, error as Error);
    }
  }

  private adjustBoundsToFitArea(
    bounds: google.maps.LatLngBounds,
    map: google.maps.Map,
  ): google.maps.LatLngBounds {
    const MAX_AREA = 77500000000; // Maximum allowed area in square meters
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const nw = new google.maps.LatLng(ne.lat(), sw.lng());
    const se = new google.maps.LatLng(sw.lat(), ne.lng());

    // Compute the area of the initial bounds
    const initialArea = google.maps.geometry.spherical.computeArea([ne, nw, sw, se]);

    // If the initial area is within the limit, return the original bounds
    if (initialArea <= MAX_AREA) {
      return bounds;
    }

    // Compute aspect ratio of the map
    const mapDiv = map.getDiv();
    const aspectRatio = mapDiv.offsetWidth / mapDiv.offsetHeight;

    // Calculate scaling factor to meet the area constraint
    const scale = Math.sqrt(MAX_AREA / initialArea);

    // Compute new latitude and longitude deltas
    const latDelta = (ne.lat() - sw.lat()) * scale;
    const lngDelta = ((ne.lng() - sw.lng()) * scale) / aspectRatio;

    // Compute new NE and SW points, ensuring they are within the initial bounds
    const newNE = new google.maps.LatLng(
      Math.min(ne.lat(), sw.lat() + latDelta),
      Math.min(ne.lng(), sw.lng() + lngDelta),
    );
    const newSW = new google.maps.LatLng(
      Math.max(sw.lat(), ne.lat() - latDelta),
      Math.max(sw.lng(), ne.lng() - lngDelta),
    );

    // Return new bounds
    return new google.maps.LatLngBounds(newSW, newNE);
  }

  private createPolygonWithLabel(subArea: FSSubArea, map: google.maps.Map) {
    let mapShape: google.maps.Polygon | google.maps.Circle | null = null;

    if (subArea.polygon_points === null) {
      const center = new google.maps.LatLng(subArea.lat, subArea.lng);

      mapShape = new google.maps.Circle({
        center: center,
        radius: subArea.radius,
        strokeColor: subArea.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: subArea.color,
        fillOpacity: 0.35,
      });
    } else {
      // Extract the polygon points and transform them into google.maps.LatLng objects
      const paths = subArea.polygon_points[0].map(
        point => new google.maps.LatLng(point[1], point[0]),
      );

      // Create the polygon
      mapShape = new google.maps.Polygon({
        paths: paths,
        strokeColor: subArea.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: subArea.color,
        fillOpacity: 0.35,
      });
    }

    // Calculate the center of the polygon
    // const bounds = new google.maps.LatLngBounds();
    // paths.forEach(path => bounds.extend(path));
    // const center = bounds.getCenter();

    // // Create a label (using a custom overlay or a third-party library)
    // // Here's a simple example using a DOM element
    // const label = document.createElement('div');
    // label.style.position = 'absolute';
    // label.style.color = 'black';
    // label.style.backgroundColor = 'white';
    // label.style.padding = '2px';
    // label.style.border = '1px solid black';
    // label.textContent = data.name;

    // // Add the label to the map
    // // Note: Adjust positioning as needed
    // const projection = map.getProjection();
    // const position = projection?.fromLatLngToPoint(center);

    // if (position) {
    //   const scale = Math.pow(2, map.getZoom()!);
    //   label.style.left = `${position.x * scale - label.offsetWidth / 2}px`;
    //   label.style.top = `${position.y * scale - label.offsetHeight / 2}px`;
    // }

    // map.getDiv().appendChild(label);

    // Add the polygon to the map
    mapShape!.setMap(map);
    subArea.mapShape = mapShape;
  }

  private clearAreas() {
    this.areas.forEach(area => {
      area.sub_areas?.forEach(subArea => {
        subArea?.mapShape?.setMap(null); // Remove the polygon from the map
      });
    });

    this.areas.clear();
  }
}
*/
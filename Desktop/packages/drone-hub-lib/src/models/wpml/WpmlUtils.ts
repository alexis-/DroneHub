import { xmlToClass, classToXml } from 'xml-class-transformer';
import { formatXml } from '../../utils/pretty-xml';
import { WpmlRoot } from './WpmlDocument';

/**
 * Parses a WPML XML string into a WpmlRoot object
 * @param xml The XML string to parse
 * @returns WpmlRoot object
 */
export function parseWpml(xml: string): WpmlRoot {
  const root = xmlToClass(xml, WpmlRoot);

  root.document.folder.placemarks.forEach((placemark) => {
    placemark.point.coordinates = placemark.point.coordinates.replaceAll(' ', '').replaceAll('\n', '');
  })

  return root;
}

/**
 * Serializes a WpmlRoot object to XML string
 * @param wpml The WpmlRoot object to serialize
 * @returns XML string
 */
export function serializeWpml(wpml: WpmlRoot): string {
  const xml = classToXml(wpml).replace('<kml>', '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:wpml="http://www.dji.com/wpmz/1.0.6">');
  return formatXml(xml);
}

/**
 * Extracts coordinates from a coordinate string in the format "longitude,latitude"
 * @param coordinateStr The coordinate string to parse
 * @returns Object containing latitude and longitude, or undefined if invalid format
 */
export function parseCoordinates(coordinateStr: string): { latitude: number; longitude: number } | undefined {
  const match = /\s*(\d+(\.\d+)?),\s*(\d+(\.\d+)?)\s*/.exec(coordinateStr);
  if (!match) return undefined;

  return {
    latitude: parseFloat(match[3]),
    longitude: parseFloat(match[1])
  };
}

/**
 * Creates a coordinate string in the format "longitude,latitude" from numeric values
 * @param longitude The longitude value
 * @param latitude The latitude value
 * @returns Formatted coordinate string
 */
export function formatCoordinates(longitude: number, latitude: number): string {
  return `${longitude},${latitude}`;
}

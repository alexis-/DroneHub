import defaultMapStyle from '@/../assets/maps-default.png';
import satelliteMapStyle from '@/../assets/maps-satellite2.png';

const mapStyles: MapStyle[] = [
  {
    id: 'openStreetMap',
    title: 'Map',
    img: defaultMapStyle,
  },
  {
    id: 'satellite',
    title: 'Satellite',
    img: satelliteMapStyle,
  },
];


export default mapStyles;
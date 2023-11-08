
import type { Map, LayerGroup } from 'leaflet';
import { Route } from '../../../ridehub-common'
export class MapData{
    
    centerLat  = 50.2;   // centre of cornwall?
    centerLng  = -5.1;   // centre of cornwall?
    zoom = 10;
    currentRoute = new Route;
    currentTab = '';
    
}
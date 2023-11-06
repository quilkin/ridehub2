import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../ridehub-common'
import { Alert, Message} from './alert'
import { Route } from './route'
import {Buffer} from 'buffer'

let routes = [] as Route[];

const Routes = {
    getIndex: function(index : number) {
        return routes[index];
    },
    addNewRoute: function(route : Route) {
        routes.push(route);
    },
    filteredList: function(minRouteLength : number, maxRouteLength: number, alphaOrder: number, reverse: boolean = false) {
        const partRoutes = [] as Route[];
        if (routes != undefined) {
            for (const route of routes) {
                if (route.distance > minRouteLength && route.distance < maxRouteLength && route.hasGPX) {
                    partRoutes.push(route);
                }
            }
        }
        if (reverse) {
            if (alphaOrder == 1)
                partRoutes.sort((a,b) => (b.dest < a.dest ? -1:1));
            else if (alphaOrder == 2)
                partRoutes.sort((a,b) => b.distance - a.distance);
            else {
                partRoutes.sort((a,b) => Route.climbingRatio(b) - Route.climbingRatio(a));
            }
        }
        else {
            if (alphaOrder == 1)
                partRoutes.sort((a,b) => (a.dest < b.dest ? -1:1));
            else if (alphaOrder == 2)
                partRoutes.sort((a,b) => a.distance - b.distance);
            else {
                partRoutes.sort((a,b) => Route.climbingRatio(a) - Route.climbingRatio(b));

            }
        }
        return partRoutes;
    },

    getRouteSummaries: async function()
    {
        const response : Route[]  = await myFetch(apiMethods.getRoutes,0, true,true);
        if (response != null) {
            routes = response;
            if (routes.length === 0) {
                Alert( 'Ridehub','No routes found!','','error','OK');
                return null;
            }
            return 'OK';
        }
        else {
            await Alert('Unsuccessful','Could not contact server','','error','OK');
            return null;
        }

    },
    findRoute: function(id: number) {
        
        const r = routes.find((index) => { return index["id"] === id })
        if (r != undefined)
        {
            //const route : Route = r;
            return r;
        }
        return new Route();
    },
    downloadGpx: async (route: Route) => {
        let gpx: string = route.url;
    
        if (gpx.length>0) {
            const link = document.createElement('a');
            link.href = 'data:application/gpx+xml;base64,' + Buffer.from(gpx).toString('base64');
            link.download = route.dest + '.gpx';
            link.click();
            URL.revokeObjectURL(link.href);
        }
        else
            await Message('Sorry, no GPX available for this route');
      }
}
export default Routes;
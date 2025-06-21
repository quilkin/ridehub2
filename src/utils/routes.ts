import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../ridehub-server/src/common/apimethods'
import { Route} from '../../../ridehub-server/src/common/route'
import  routeFuncs  from '../utils/routeFuncs'
import { Alert, Message} from './alert'
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
                partRoutes.sort((a,b) => (b.dest.toLowerCase() < a.dest.toLowerCase() ? -1:1));
            else if (alphaOrder == 2)
                partRoutes.sort((a,b) => b.distance - a.distance);
            else {
                partRoutes.sort((a,b) => routeFuncs.climbingRatio(b) - routeFuncs.climbingRatio(a));
            }
        }
        else {
            if (alphaOrder == 1)
                partRoutes.sort((a,b) => (a.dest.toLowerCase() < b.dest.toLowerCase() ? -1:1));
            else if (alphaOrder == 2)
                partRoutes.sort((a,b) => a.distance - b.distance);
            else {
                partRoutes.sort((a,b) => routeFuncs.climbingRatio(a) - routeFuncs.climbingRatio(b));

            }
        }
        return partRoutes;
    },
    /**
     * keep a master list of all routes already downloaded.
     * @param newRoutes = those to be added from a new fetch
     */
    mergeRoutes: function(newRoutes : Route[])  {

        newRoutes.forEach((newRoute) => {
            if (routes.find((route)=>route.id === newRoute.id ) === undefined)
            // not already in store
                routes.push(newRoute);
        });
     },
    /**
     * get routes from database according to a list of route IDs
     * ...but don't add routes already in store
     */
    getRoutesByID: async function(idList: number[])
    {
        const routeList : Route[]  = await myFetch(apiMethods.getRoutesById,idList);
        if (routeList != null) {
           
            routeList.forEach((route)=> {
                // get rid of silly characters
                    route.dest = route.dest.replace(/[^0-9a-z ]/gi, '');
            })
            this.mergeRoutes(routeList);
            return routeList;
        }
        else {
            await Alert('Unsuccessful','Could not contact server','','error','OK');
            return null;
        }

    },
    /***
     * get routes from database according to distance group
     * ...but don't add routes already in store
     */
    getRoutesByDistance: async function(distances: number[])
    {
        const distanceList : Route[]  = await myFetch(apiMethods.getRoutesByDs,distances);
        if (distanceList  != null) {
            
            distanceList.forEach((route)=> {
                // get rid of silly characters
                    route.dest = route.dest.replace(/[^0-9a-z ]/gi, '');
            })
            this.mergeRoutes(distanceList);
            return distanceList;
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
            return r;
        }
        return new Route();
    },
    downloadGpx: async (route: Route | undefined) => {

        if (route == undefined) {
            await Message('Sorry, route not found for download');
            return;
        }
        const gpx  = await myFetch(apiMethods.getGpx, route.id);
        if (gpx.route.length>0) {
            const link = document.createElement('a');
            link.href = 'data:application/gpx+xml;base64,' + Buffer.from(gpx.route).toString('base64');
            link.download = route.dest + '.gpx';
            link.click();
            URL.revokeObjectURL(link.href);
        }
        else
            await Message('Sorry, no GPX available for this route');
      }
}
export default Routes;
import { apiMethods, myFetch } from './fetch'
import { Alert} from './alert'
import { Route } from './route'

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
        const response : Route[]  = await myFetch(apiMethods.getRoutes,0);
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
}
export default Routes;
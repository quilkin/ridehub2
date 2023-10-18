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
    filteredList: function(minRouteLength : number, maxRouteLength: number, alphaOrder: boolean, reverse: boolean = false) {
        const partRoutes = [] as Route[];
        if (routes != undefined) {
            for (const route of routes) {
                if (route.distance > minRouteLength && route.distance < maxRouteLength) {
                    partRoutes.push(route);
                }
            }
        }
        if (reverse) {
            if (alphaOrder)
                partRoutes.sort((a,b) => (b.dest < a.dest ? -1:1));
            else
                partRoutes.sort((a,b) => b.distance - a.distance);
        }
        else {
            if (alphaOrder)
                partRoutes.sort((a,b) => (a.dest < b.dest ? -1:1));
            else
                partRoutes.sort((a,b) => a.distance - b.distance);
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
    // distanceStr: function(route : Route, userUnits : string) {
    //     var distance = 0;
    //     if (route.distance !== undefined) {
    //         distance = route.distance;
    //     }
    //     if (distance === 0)
    //         return '?';
    //     var units = ' km ';
    //     if (userUnits === 'm') {
    //         units = ' ml ';
    //         distance = Math.round(distance * 0.62137);
    //     }
    //     return distance + units;
    // },
    // climbingStr: function(route : Route, userUnits : string) {
    //     //var style = '<span style="color:orange; ';
    //     var units = ' m';
    //     var climbing = 0;
    //     if (route.climbing !== undefined) {
    //         climbing = route.climbing;
    //         if (climbing ===0)
    //             return '';
    //         if (userUnits === 'm') {
    //             units = ' ft';
    //             climbing = Math.round(climbing * 3.3);
    //         }
    //         var climbingStr =  climbing + units ;
    //         return climbingStr;
    //     }
    //     return '';
    // },
    // climbingColour: function(route : Route) {
    //     var colour = 'orange';
    //     var climbing = 0;
    //     if (route.climbing !== undefined) {
    //         climbing = route.climbing;
    //         if (climbing ===0)
    //             return 'white';
    //         if (route.distance > 0) {
    //             var climbRatio = route.climbing / route.distance;
    //             if (climbRatio < 12)
    //                 colour = 'green';
    //             else if (climbRatio > 17)
    //                 colour= 'red';
    //         }
    //         return colour;
    //     }
    //     return 'white';
    // }
}
export default Routes;
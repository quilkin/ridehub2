import { ref , type Ref } from 'vue'
import { myFetch } from './fetch'
import { Alert} from './alert'
import { Route } from './route'


const routes = ref() as Ref<Route[]>;
var currentRoute : Route;

const Routes = {
    getIndex: function(index : number) {
        return routes.value[index];
    },
    filteredList: function(minRouteLength : number, maxRouteLength: number, alphaOrder: boolean) {
        const partRoutes = [] as Route[];
        for (const route of routes.value) {
            if (route.distance > minRouteLength && route.distance < maxRouteLength) {
                partRoutes.push(route);
            }
        }
        if (alphaOrder)
            partRoutes.sort((a,b) => (a.dest < b.dest ? -1:1));
        else
            partRoutes.sort((a,b) => a.distance - b.distance);
        return partRoutes;
    },
    currentRoute: function() {
        return currentRoute;
    },
    // setRoute: function(route : Route)   {
    //     currentRoute = route;
    // },
    getRouteSummaries: async function()
    {
        console.log('getting route summaries');
        const response : Route[]  = await myFetch("GetRoutes",0, true);
        if (response != null) {
            routes.value = response;
            if (routes.value.length === 0) {
                Alert( 'Ridehub','No routes found!','','error','OK');
                return null;
            }
            console.log('got routes');
            return 'OK';
        }
        else {
            Alert('Unsuccessful','Could not contact server','','error','OK');
            return null;
        }

    },
    findRoute: function(id: number) {
        
        const r = routes.value.find((index) => { return index["id"] === id })
        if (r != undefined)
        {
            const route : Route = r;
            currentRoute = route;
            return route;
        }
        return null;
    },
    distanceStr: function(route : Route, userUnits : string) {
        var distance = 0;
        if (route.distance !== undefined) {
            distance = route.distance;
        }
        if (distance === 0)
            return '?';
        var userUnits = ' km ';
        if (userUnits === 'm') {
            userUnits = ' m ';
            distance = Math.round(distance * 0.62137);
        }
        return distance + userUnits;
    },
    climbingStr: function(route : Route, userUnits : string) {
        //var style = '<span style="color:orange; ';
        var units = 'm';
        var climbing = 0;
        if (route.climbing !== undefined) {
            climbing = route.climbing;
            if (climbing ===0)
                return '';
            if (userUnits === 'm') {
                units = 'ft';
                climbing = Math.round(climbing * 3.3);
            }
            var climbingStr =  climbing + units ;
            return climbingStr;
        }
        return '';
    },
    climbingColour: function(route : Route) {
        var colour = 'orange';
        var climbing = 0;
        if (route.climbing !== undefined) {
            climbing = route.climbing;
            if (climbing ===0)
                return 'white';
            if (route.distance > 0) {
                var climbRatio = route.climbing / route.distance;
                if (climbRatio < 12)
                    colour = 'green';
                else if (climbRatio > 17)
                    colour= 'red';
            }
            return colour;
        }
        return 'white';
    }
}
export default Routes;
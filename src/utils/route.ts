import { ref , type Ref } from 'vue'
import { myFetch } from '../components/fetch'
import  { Alert} from '../components/alert'

export class Route {
    dest = '';
    url= '';
    id = 0;
    climbing = 0;
    distance= 0;
    owner = '';
    hasGPX = this.url.length > 0;
}

const routes = ref() as Ref<Route[]>;

const Routes = {
    getRouteSummaries: async function()
    {
    myFetch("GetRoutes",0, true)
        .then ((response) => {
            routes.value = response;
            if (routes.value.length === 0) {
                Alert( 'Ridehub','No routes found!','error','OK');
            //  return null;
            }
            //  return routes;
            });
    },
    findRoute: function(id: number) {
        
        const r = routes.value.find((index) => { return index["id"] === id })
        if (r != undefined)
        {
            const route : Route = r;
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
            // if (route.distance > 0) {
            //     var climbRatio = route.climbing / route.distance;
            //     if (climbRatio < 12)
            //         style = '<span style="color:green; ';
            //     else if (climbRatio > 17)
            //         style = '<span style="color:red; ';
            // }
            if (userUnits === 'm') {
                units = 'ft';
                climbing = Math.round(climbing * 3.3);
            }
            //var climbingStr = '&uarr;' + climbing + units + '&darr;';
            var climbingStr =  climbing + units ;
            return climbingStr;
        }
        return '';
    },
    climbingColour: function(route : Route, userUnits : string) {
        var colour = 'orange';
        var climbing = 0;
        if (route.climbing !== undefined) {
            climbing = route.climbing;
            if (climbing ===0)
                return '';
            if (route.distance > 0) {
                var climbRatio = route.climbing / route.distance;
                if (climbRatio < 12)
                    colour = 'green';
                else if (climbRatio > 17)
                    colour= 'red';
            }
            return colour;
        }
        return '';
    }
}
export default Routes;
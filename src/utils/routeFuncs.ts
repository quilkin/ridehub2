import { Route } from '../../../ridehub-server/src/common/route'

    const routeFuncs = {
  
    /**
   * display distance in miles or km as required by user
   * @param route 
   * @param userUnits 
   * @returns 
   */
    distanceStr: function(route: Route, userUnits : string): string   {
        var distance = 0;
        if (route.distance !== undefined) {
            distance = route.distance;
        }
        if (distance === 0)
            return '?';
        var units = ' km ';
        if (userUnits === 'm') {
            units = ' ml ';
            distance = Math.round(distance * 0.62137);
        }
        return distance + units;
    },
     /**
     * Display amount of cli9mbing for the route, in feet or meters as reqd
     * @param route 
     * @param userUnits 
     * @returns 
     */
    climbingStr: function(route : Route, userUnits : string) {
        var units = ' m';
        var climbing = 0;
        if (route.climbing !== undefined) {
            climbing = route.climbing;
            if (climbing ===0)
                return '';
            if (userUnits === 'm') {
                units = ' ft';
                climbing = Math.round(climbing * 3.3);
            }
            var climbingStr =  climbing + units ;
            return climbingStr;
        }
        return '';
    },

    /**
     * Find a colour to show the difficulty of route in terms of climbing amount
     * @param route 
     * @returns one of 4 colours
     */
    climbingColour: function (route : Route) {
        const ratio = this.climbingRatio(route);
        if (ratio > 17) return 'red';
        if (ratio > 12) return 'orange';
        if (ratio > 0) return 'green';
        return 'white';
    },
    /**
     * Calulate the relative amount of climbing for a route
     * @param route 
     * @returns climbs as metres per km
     */
    climbingRatio: function(route: Route)
    {
        if (route.climbing == undefined) 
            return 0;
        if (route.climbing ===0)
            return 0;
        if (route.distance ===0)
            return 0;

        const climbRatio = route.climbing / route.distance;
        return Math.round(climbRatio);
    },
    /**
     * 
     * @param route Converts number to displayed string
     * @returns 
     */
    climbingRatioStr: function(route: Route)
    {
        return this.climbingRatio(route).toString();
    }
}
export default routeFuncs;
export class Route {
    dest = '';
    url= '';
    id = 0;
    climbing = 0;
    distance= 0;
    owner = '';
    hasGPX = this.url.length > 0;
    // not actually used but required for compatability with old DB
    description = '';

  
    public static distanceStr(route: Route, userUnits : string): string   {
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
    }
    public static climbingStr(route : Route, userUnits : string) {
        //var style = '<span style="color:orange; ';
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
    }
    public static climbingColour (route : Route) {
        const ratio = this.climbingRatio(route);
        if (ratio > 17) return 'red';
        if (ratio > 12) return 'orange';
        if (ratio > 0) return 'green';
        return 'white';
    }
    public static climbingRatio(route: Route)
    {
        if (route.climbing == undefined) 
            return 0;
        if (route.climbing ===0)
            return 0;
        if (route.distance ===0)
            return 0;

        const climbRatio = route.climbing / route.distance;
        return Math.round(climbRatio);
    }
}
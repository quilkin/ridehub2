import  TimesDates  from '../utils/timesdates'
export class Ride {
    leaderName = 'leader';
    routeID = 0;
    date = TimesDates.toIntDays(new Date());
    rideID = 0;
    time = 540;     // default 9 am
    meetingAt = 'Lemon Quay';
    description = 'description';
    groupSize = 10;
    speed = 20;   
}
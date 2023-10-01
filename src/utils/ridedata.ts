// non-vue parts extracted to keep 'ridelist.vue' a sensible size


import { ref , type Ref } from 'vue'
import { myFetch } from './fetch'
import { Alert, YesNo, Message} from './alert'
//import  { YesNo } from './question'
import Swal from 'sweetalert2'

class Participant {
    rider : string;
    rideID : number;
    constructor(r: string, id : number) {
        this.rider = r;
        this.rideID = id;
      }
}
const rideData = {

    saveParticipant: async function (rideID : number, rider : string) {
        var list = "";
        //await Swal.fire("saveParticipant");
        //Alert('test message','Please wait...','','info','OK');
        await Message('saveParticipant test message')
        await YesNo("Join this ride",async ()=> {

            const pp = new Participant(rider, rideID);
            const response = await myFetch("SaveParticipant", pp, true);
            if (response[0] === '*') {
                    // a list of riders entered
                    list = response.substr(1);
                    Message("You have been added to this ride");
                    return list;
                    //RideList.CreateRideList(null);
            }
            else {
                    Message(response);
                    return null;
                }
        });
        return null;
    },

}

export default rideData;
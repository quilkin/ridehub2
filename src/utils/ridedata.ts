// non-vue parts extracted to keep 'ridelist.vue' a sensible size

import { myFetch } from './fetch'
import { Alert, YesNo, Message, chooseFromTwo} from './alert'

class Participant {
    rider : string;
    rideID : number;
    constructor(r: string, id : number) {
        this.rider = r;
        this.rideID = id;
      }
}
const rideData = {

    saveParticipant: async function (rideID : number, rider : string, dest : string) {
        //var list = "";
        await YesNo(dest + ": Join this ride?",async ()=> {

            const pp = new Participant(rider, rideID);
            const response = await myFetch("SaveParticipant", pp, true);
            if (response[0] === '*') {
                    await Message("You have been added to this ride");
            }
            else {
                    await Message(response);
                }
        });
    },
    saveReserveParticipant: async function (rideID : number, rider : string) {
        var list = "";
        await YesNo("Ride is full, Would you like to be on a  reserve list?", async ()=> {
            var reserve = '+' + rider;
            var pp = new Participant(reserve, rideID);
            const response = await myFetch("SaveParticipant", pp, true);
            if (response[0] === '*') {
                await Message("You have been added to reserve list for this ride");
            }
            else {
                await Message(response);
            }
        });
    },
    meParticipant: async function (rideID : number, rider : string) {
        await chooseFromTwo(
            "You are signed up for this ride: what do you want to do?",
            "Leave the ride",
            "Add a guest rider",
            async ()=> {
                var pp = new Participant(rider, rideID);
                const response = await myFetch("LeaveParticipant", pp, true);
                if (response === 'OK') {
                    await Message("You have left this ride");
                }
                else {
                    await Message(response);
                }
            },
            async ()=> {
                var guest = rider + '+';
                var pp = new Participant(guest, rideID);
                const response = await myFetch("SaveParticipant", pp, true);
                if (response[0] === '*') {
                    await Message("A guest has been added to this ride. Guest will need to complete a guest form at the start");
                }
                else {
                    await Message(response);
                }
            });
      
    },
    mePlusParticipant: async function (rideID : number, rider : string) {
        var guest = rider + '+';
        await chooseFromTwo(
            "You have signed a guest for this ride: what do you want to do?",
            "Remove your guest",
            "Both leave the ride",
            async ()=> {
                
                var pp = new Participant(guest, rideID);
                const response = await myFetch("LeaveParticipant", pp, true);
                if (response === 'OK') {
                    await Message("Your guest has left this ride");
                    }
                    else {
                        await Message(response);
                    }
                },
                async ()=> {
                    var pp = new Participant(guest, rideID);
                    var response = await myFetch("LeaveParticipant", pp, true);
                    if (response === 'OK') {
                        pp = new Participant(rider, rideID);
                        response = await myFetch("LeaveParticipant", pp, true);
                        if (response === 'OK') {
                                await Message("You have both left this ride");
                            }
                            else {
                                await Message(response);
                            }
                        }
                    else {
                        await Message(response);
                    }
                }

        )
    },

    saveGuest: async function (rideID : number, rider : string) {
        await YesNo("Join a guest for this ride?Are you sure?",  async ()=> {
            var guest = rider + '+';
            var pp = new Participant(guest, rideID);
            const response = await myFetch("SaveParticipant", pp, true);
            if (response[0] === '*') {
                await Message("A guest has been added to this ride. Guest will need to complete a guest form at the start");
            }
            else {
                await Message(response);
            }
        });

    },
    leaveParticipant: async function (rideID : number, rider : string) {
        await YesNo("Leave this ride?", async ()=> {
            var pp = new Participant(rider, rideID);
            const response = await myFetch("LeaveParticipant", pp, true);
            if (response === 'OK') {
                await Message("You have left this ride");
            }
            else {
                await Message(response);
            }
        });
 
    },
    leaveGuest: async function (rideID : number, rider : string) {
        var guest = rider + '+';
        await YesNo("Remove guest from this ride?", async ()=> {
            var pp = new Participant(guest, rideID);
            const response = await myFetch("LeaveParticipant", pp, true);
            if (response === 'OK') {
                await Message("Your guest has left this ride");
                }
                else {
                    await Message(response);
                }
            });
    },
    leaveBoth: async function (rideID : number, rider : string) {
        var guest = rider + '+';
        await YesNo("Remove you and your guest from this ride?", async ()=> {
            var pp = new Participant(guest, rideID);
            var response = await myFetch("LeaveParticipant", pp, true);
            if (response === 'OK') {
                pp = new Participant(rider, rideID);
                response = await myFetch("LeaveParticipant", pp, true);
                if (response === 'OK') {
                        await Message("You have both left this ride");
                    }
                    else {
                        await Message(response);
                    }
                }
            else {
                await Message(response);
            }
        });
    }

}

export default rideData;
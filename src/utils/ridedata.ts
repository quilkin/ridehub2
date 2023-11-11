// non-vue parts extracted to keep 'ridelist.vue' a sensible size

import { myFetch } from '@/utils/fetch'
import { apiMethods, Participant } from '../../../ridehub-common'
import { AlertError, YesNo, Message, chooseFromTwo} from './alert'

const rideData = {

    speedsToString: function(min:number,max:number) {

        // make a 'from-to' text for max and min average speeds, e.g. 18-20 kph
        let speedStr = '';
        if (min == max)
            speedStr= min.toString();
        else if (min == 0)
            speedStr= '0';
        else
            speedStr=  min.toString() + '-' + max.toString();
        return speedStr;

    },
    stringToSpeeds: function(str : string) : number[]{
        let min=0, max=0;
           // enumerate the min-max speed string
        const speeds = str.split('-');
        if (speeds.length == 1)
            min = max = parseInt(speeds[0]);
        else if (speeds.length == 2){
            min =  parseInt(speeds[0]);
            max =  parseInt(speeds[1]);
        }
        if (isNaN(min)) return [];
        if (isNaN(max)) return [];
 
        return [min,max];
    },
    saveParticipant: async function (rideID : number, rider : string, dest : string) {
        //var list = "";
        await YesNo(dest + ": Join this ride?",async ()=> {

            const pp = new Participant(rider, rideID);
            const response = await myFetch(apiMethods.savePpt, pp);
            if (!response ) 
                await  AlertError('server error', 'could not join ride');
            else if (response[0] === '*') {
                await Message("You have been added to this ride");
            }
            else {
                await Message(response);
            }
        });
    },
    saveReserveParticipant: async function (rideID : number, rider : string) {
        //var list = "";
        await YesNo("Ride is full, Would you like to be on a  reserve list?", async ()=> {
            //var reserve = '+' + rider;
            const pp = new Participant('+' + rider, rideID);
            const response = await myFetch(apiMethods.savePpt, pp);
            if (!response ) 
                await  AlertError('server error', 'could not reserve ride');
            else if (response[0] === '*') {
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
                const pp = new Participant(rider, rideID);
                const response = await myFetch(apiMethods.leavePpt, pp);
                if (!response ) 
                    await  AlertError('server error', 'could not leave ride');
                else if (response === 'OK') {
                    await Message("You have left this ride");
                }
                else {
                    await Message(response);
                }
            },
            async ()=> {
                // var guest = rider + '+';
                const pp = new Participant(rider + '+', rideID);
                const response = await myFetch(apiMethods.savePpt, pp);
                if (!response ) 
                    await  AlertError('server error', 'could not add guest to ride');
                else if (response[0] === '*') {
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
                
                const pp = new Participant(guest, rideID);
                const response = await myFetch(apiMethods.leavePpt, pp);
                if (!response ) 
                    await  AlertError('server error', ' guest could not leave ride');
                else if (response === 'OK') {
                    await Message("Your guest has left this ride");
                    }
                    else {
                        await Message(response);
                    }
                },
                async ()=> {
                    var pp = new Participant(guest, rideID);
                    var response = await myFetch(apiMethods.leavePpt, pp);
                    if (!response ) 
                        await  AlertError('server error', 'could not leave ride');
                    else if (response === 'OK') {
                        pp = new Participant(rider, rideID);
                        response = await myFetch(apiMethods.leavePpt, pp);
                        if (!response ) 
                            await  AlertError('server error', 'could not leave ride');
                        else if (response === 'OK') {
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
            //var guest = rider + '+';
            const pp = new Participant(rider + '+', rideID);
            const response = await myFetch(apiMethods.savePpt, pp);
            if (!response ) 
                await  AlertError('server error', 'guest could not join ride');
            else if (response[0] === '*') {
                await Message("A guest has been added to this ride. Guest will need to complete a guest form at the start");
            }
            else {
                await Message(response);
            }
        });

    },
    leaveParticipant: async function (rideID : number, rider : string) {
        await YesNo("Leave this ride?", async ()=> {
            const pp = new Participant(rider, rideID);
            const response = await myFetch(apiMethods.leavePpt, pp);
            if (!response ) 
                await  AlertError('server error', 'could not leave ride');
            else if (response === 'OK') {
                await Message("You have left this ride");
            }
            else {
                await Message(response);
            }
        });
 
    },
    leaveGuest: async function (rideID : number, rider : string) {
        //var guest = rider + '+';
        await YesNo("Remove guest from this ride?", async ()=> {
            const pp = new Participant(rider + '+', rideID);
            const response = await myFetch(apiMethods.leavePpt, pp);
            if (!response ) 
                await  AlertError('server error', 'guest could not leave ride');
            else if (response === 'OK') {
                await Message("Your guest has left this ride");
                }
                else {
                    await Message(response);
                }
            });
    },
    leaveBoth: async function (rideID : number, rider : string) {
        // var guest = rider + '+';
        await YesNo("Remove you and your guest from this ride?", async ()=> {
            var pp = new Participant(rider + '+', rideID);
            var response = await myFetch(apiMethods.leavePpt, pp);
            if (!response ) 
                await  AlertError('server error', 'could not leave ride');
            else if (response === 'OK') {
                pp = new Participant(rider, rideID);
                response = await myFetch(apiMethods.leavePpt, pp);
                if (!response ) 
                    await  AlertError('server error', 'could not leave ride');
                else if (response === 'OK') {
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
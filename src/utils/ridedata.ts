// non-vue parts extracted to keep 'ridelist.vue' a sensible size

import { myFetch } from '@/utils/fetch'
import { apiMethods } from '../../../ridehub-server/src/common/apimethods'
import { Participant, rideCount } from '../../../ridehub-server/src/common/participant'
import { AlertError, YesNo, Message, LongMessage, chooseFromTwo} from './alert'

//let numRides = 0;
const rideData = {

    /**
     * Convert stored ride speed (which can be a single value, or a range) to a displayed string
     * @param min 
     * @param max 
     * @param units 
     * @returns 
     */
    speedsToString: function(min:number,max:number,units:string) {

        // make a 'from-to' text for max and min average speeds, e.g. 18-20 kph
        if (units!='k') {
            // stored in database as kph
            min = Math.round(min / 1.6);
            max = Math.round( max / 1.6);
        }
        let speedStr = '';
        if (min == 0)
            return '';
        else if (min == max)
            speedStr= min.toString();
        else
            speedStr=  min.toString() + '-' + max.toString();
        return speedStr ;

    },

    /**
     * Convert an entered string to a stored ride speed (which can be a single value, or a range) 
     * @param str 
     * @returns 
     */
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


    // checkRideCount: async function(rider: string)  {
    //         const counts :rideCount[] = await myFetch(apiMethods.ridecount,rider);
    //         numRides = counts[0].count;
    //         const isMember : string = await myFetch(apiMethods.checkMember,rider);
    //         if (isMember == 'no' && numRides > 1) {
    //                 await LongMessage('You do not seem to be a member of TCC','Please consider joining before doing more rides with us')

    //         }

    // },

    /**
     * Save a participant rider to a ride
     * @param rideID 
     * @param rider 
     * @param dest 
     */
    saveParticipant: async function (rideID : number, rider : string, dest : string) {
        
        await YesNo(dest + ": Join this ride?",async ()=> {

            //await this.checkRideCount(rider);
            const counts :rideCount[] = await myFetch(apiMethods.ridecount,rider);
            const numRides = counts.length > 0? counts[0].count : 0;
            const checkmember : string = await myFetch(apiMethods.checkMember,rider);
            const isMember = (checkmember == 'yes');

            const pp = new Participant(rider, rideID);
            const response = await myFetch(apiMethods.savePpt, pp);
            if (!response.success ) 
                await  AlertError(response.data, 'could not join ride');
            else if (response.data === 'OK') {
                let message2: string = '';
                if (numRides > 1) message2 =`You have now joined ${numRides} rides from RideHub.`;
                message2 += isMember? 'Thank you for being a TCC member!':'You do not seem to be a member of TCC. Please consider joining before doing more rides with us';
                await LongMessage("You have been added to this ride",message2);
                  
            }
            else {
                await Message(response.data);
            }
        });
    },

    /**
     * Put a rider on the reserve list for this ride
     * @param rideID 
     * @param rider 
     */
    saveReserveParticipant: async function (rideID : number, rider : string) {
        //var list = "";
        await YesNo("Ride is full, Would you like to be on a  reserve list?", async ()=> {
            //var reserve = '+' + rider;
            const pp = new Participant('+' + rider, rideID);
            const response = await myFetch(apiMethods.savePpt, pp);
            if (!response ) 
                await  AlertError('server error', 'could not reserve ride');
            else if (response === 'OK') {
                await Message("You have been added to reserve list for this ride");
            }
            else {
                await Message(response);
            }
        });
    },

    /**
     * Allow a rider to remove themselves from the ride, or add a guest
     * @param rideID 
     * @param rider 
     * @param leader 
     */
    meParticipant: async function (rideID : number, rider : string, leader : string) {
        await chooseFromTwo(
            "You are signed up for this ride: what do you want to do?",
            "Leave the ride",
            "Add a guest rider",
            async ()=> {
                if (rider===leader) {
                    await Message("You cannot leave your own ride");
                    return;
                }
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
                
                const pp = new Participant(rider + '+', rideID);
                const response = await myFetch(apiMethods.savePpt, pp);
                if (!response ) 
                    await  AlertError('server error', 'could not add guest to ride');
                else if (response === 'OK') {
                    await Message("A guest has been added to this ride. Guest will need to complete a guest form at the start");
                }
                else {
                    await Message(response);
                }
            });
      
    },

    /**
     * Allow rider to remove a guest rider
     * @param rideID 
     * @param rider 
     * @param leader 
     */
    mePlusParticipant: async function (rideID : number, rider : string, leader : string) {
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
                    if (rider===leader) {
                        await Message("You cannot leave your own ride");
                        return;
                    }
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

    /**
     * Allow a rider to add a guest to the ride
     * @param rideID 
     * @param rider 
     */
    saveGuest: async function (rideID : number, rider : string) {
        await YesNo("Join a guest for this ride?Are you sure?",  async ()=> {
            //var guest = rider + '+';
            const pp = new Participant(rider + '+', rideID);
            const response = await myFetch(apiMethods.savePpt, pp);
            if (!response ) 
                await  AlertError('server error', 'guest could not join ride');
            else if (response === 'OK') {
                await Message("A guest has been added to this ride. Guest will need to complete a guest form at the start");
            }
            else {
                await Message(response);
            }
        });

    },

    /**
     * Alow a rider to leave the ride
     * @param rideID 
     * @param rider 
     * @param remover 
     * @param dest 
     */
    leaveParticipant: async function (rideID : number, rider : string, remover: string = '', dest: string  = "") {
        let beingRemoved: Boolean = (remover.length > 0);
        await YesNo(beingRemoved? `Remove '${rider}' from this ride?` : "Leave this ride?", async ()=> {
            const pp = new Participant(rider, rideID);
            const response = await myFetch(apiMethods.leavePpt, pp);
            if (!response ) 
                await  AlertError('server error', 'could not leave ride, sorry');
            else if (response === 'OK') {
                if (beingRemoved) {
                    await Message(`'${rider}' was removed from this ride`);
                    // add an entry into the log file (in case of mis-use)
                   await myFetch(apiMethods.logAction,`'${rider}' was removed from ride ${rideID} (${dest}) by ${remover}`);
                }
                else
                 await Message("You have left this ride");
            }
            else {
                await Message(response);
            }
        });
 
    },

    /**
     * Allow a rider to emove their guest from the ride
     * @param rideID 
     * @param rider 
     */
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

    /**
     * 
     * @param rideID Allow a rider to remove both tehmsle and their guest
     * @param rider 
     */
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
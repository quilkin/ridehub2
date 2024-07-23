import rideData from '@/utils/ridedata'

export const nameRules =   [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value.includes(' ')) return 'No spaces in username please'
                                 if (value.includes("'")) return 'No apostrophes in username please'
                                if (value.length >= 3) return true
                                return 'Username is 3 to 10 characters.'
                                },
                            ];

export const pwRules =     [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value?.length >= 6) return true
                                return 'password is 6 characters or more.'
                                },
                            ];
export const emailRules = [
                            (value: string) => !!value || 'Required.',
                            (value: string) => {
                            if (/.+@.+\..+/.test(value)) return true
                            return 'E-mail must be a valid address.'
                            },
                        ];
export const destinationRules =   [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value.includes("'")) return 'No apostrophes in destination please'
                                if (value.length >= 3 && value.length <= 30) return true
                                return 'Destination should be 3 to 30 characters. More info can be entered into the ride deatils'
                                },
                            ];
export const distanceRules = [ 
                            (value: number) => !!value || 'Required.', 
                            (value: number) => {
                                if (value >= 3 ) return true
                                return 'Distance should be more than this!'
                                },
                            ];
export const meetingRules = [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value.includes("'")) return 'No apostrophes  please'
                                if (value.length >= 3 && value.length <= 30) return true
                                return 'Meeting place should be 3 to 30 characters'
                                },
                            ];
export const ridersRules = [ 
                            (value: number) => !!value || 'Required.', 
                            (value: number) => {
                                if (value >= 3 && value < 20 ) return true
                                return value < 3 ? 'You need to allow more riders' :'too many riders; please split ride into two'
                                },
                            ];
export const speedRules = [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value==='0')
                                    return true;
                                const speeds = rideData.stringToSpeeds(value);
                                if (speeds.length< 2)
                                    return 'Please use a small range, e.g. 16-18';
                                let min = speeds[0];
                                let max = speeds[1];
                                if (min > max) 
                                    return 'Minimum must be less than maximum'
                                if (min >= 5 && min < 30 && max >= 5 && min < 30) return true;
                                return min < 5 ? 'Too slow' :'Too fast'
                                },
                            ];
export const gpxRules = [ 
                            (files : File[] ) => !!files || 'Required.', 
                            (value: File[]) => {
                                if (value.length===0) return true;
                                if (value[0].name.length >= 3 && value[0].name.length <= 26) return true
                                return 'Filename too long, please shorten to less than 25 and try again'
                                },
                            ];
export const descriptionRules = [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value.includes("'")) return 'No apostrophes in description please'
                                if (value.length >= 10 && value.length <= 200) return true
                                return 'Desciption should be between 10 and 200 characters'
                                },
                            ];
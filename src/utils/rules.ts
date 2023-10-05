export const nameRules =   [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
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
                            (value: number) => !!value || 'Required.', 
                            (value: number) => {
                                if (value >= 8 && value < 30 ) return true
                                return value < 8 ? 'Too slow' :'Too fast'
                                },
                            ];
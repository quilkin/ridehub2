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
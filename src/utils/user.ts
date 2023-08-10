export const Roles = { None: 0, Viewer: 1, SiteAdmin: 2, FullAdmin: 3 } as const;

export class User {
    
    role = Roles.None;
    id = 0;
    name = '';
    email = '';
    units = 'k';
    climbs = 1;
    passwordReset = false;
    notifications = true;
    
}
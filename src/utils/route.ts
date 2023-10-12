export class Route {
    dest = '';
    url= '';
    id = 0;
    climbing = 0;
    distance= 0;
    owner = '';
    hasGPX = this.url.length > 0;
    // not actually used but rquired for compatability with old DB
    description = '';
}
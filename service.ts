export function serviceBase(nodeServer : boolean) : string {
    //console.log(process.env.NODE_ENV);
    if (nodeServer) {
        return "http://localhost:3000/";
    }
    if (process.env.NODE_ENV !== 'development')
         return "/Routes.svc/";
    return "http://localhost/routes/routes.svc/";


}
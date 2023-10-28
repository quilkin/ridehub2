export function serviceBase() : string {
    //console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV !== 'development')
         return "/Routes.svc/";
    return "http://localhost/routes/routes.svc/";


}
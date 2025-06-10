export function serviceBase() : string {
    //console.log(process.env.NODE_ENV);
    //if (nodeServer) {
    //    return "http://localhost:3000/";
    //}
    if (process.env.NODE_ENV !== 'development')
         return "https://ridehub2.truro.cc/";
    return "http://localhost:3000/";

  //return "https://ridehub2.truro.cc/";
}
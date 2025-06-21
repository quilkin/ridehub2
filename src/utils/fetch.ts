/**
 * Fetching / sending data between client (this app) and server
 */
import  { Alert, AlertError,CloseAlert } from './alert'

function serviceBase() : string {
  
  if (process.env.NODE_ENV !== 'development')
       return "../";                    // relative path of server file (app.js)
  return "http://192.168.1.210:3000/";  // development server address
 
}

export async function myFetch(url : String, data : Object | null)  {

    const bodyData =  JSON.stringify({data}) ;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: bodyData
    }
    
    
    const fullUrl =  serviceBase() +  url;
    console.log('fetch: ' +  bodyData );
    let res;

    try {
      if (data != null)
        res = await fetch(fullUrl, options);
      else
        res = await fetch(fullUrl);

      if (res.ok) {
        return await res.json();
      }

      let error = res.statusText;
      if (res.status === 404)
      {
        // api not found
        error += `: ${url}`;
      }
      throw new Error(error);
   }

   catch (error : any) {
      await AlertError('Web error',error);
      return null;
    }
  
  }



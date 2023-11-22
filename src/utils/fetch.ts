import { apiMethods } from '../../../ridehub-common';
import  { Alert, AlertError,CloseAlert } from './alert'

function serviceBase() : string {
  
  if (process.env.NODE_ENV !== 'development')
       return "../";
  return "http://localhost:3000/";


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
    
    console.log('fetch: ' + url)
    const fullUrl =  serviceBase() +  url;
    // if (url.includes(apiMethods.login)) {
    //   alert(fullUrl);
    // }
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



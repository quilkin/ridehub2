import { apiMethods } from '../../../ridehub-server/src/common/apimethods'
import  { Alert, AlertError,CloseAlert } from './alert'

function serviceBase() : string {
  
  if (process.env.NODE_ENV !== 'development')
       return "../";
  return "http://192.168.1.210:3000/";
  //return "https://ridehub2.truro.cc/"


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
    
    console.log('fetch: ' +  bodyData)
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



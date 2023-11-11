import  { Alert, AlertError,CloseAlert } from './alert'
import { serviceBase } from '../../service'

export async function myFetch(url : String, data : Object | null, nodeServer : boolean = true)  {

   const bodyData = nodeServer? JSON.stringify({data}) : JSON.stringify(data);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: bodyData
    }
    
    console.log('fetch: ' + url)
    const fullUrl = serviceBase(nodeServer) + url;
    let res;

    try {
      res = await fetch(fullUrl, options);

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



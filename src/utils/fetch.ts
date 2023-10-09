import  { Alert,CloseAlert } from './alert'

function quilkinUrlBase() {

    //return "https://www.quilkin.co.uk/routes.svc/";
    return "http://localhost/routes/routes.svc/";

}

export async function myFetch(url : String, data : Object, waitDlg : Boolean = false)  {

    const bodyData = JSON.stringify(data);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: bodyData
    }
    if (waitDlg)   Alert('Loading','Please wait...','','info','');
    
    console.log('fetch: ' + url)
    const fullUrl = quilkinUrlBase() + url;

    let res;
    let err : string;
  
    try {
      res = await fetch(fullUrl, options);
      if (!res.ok) {
        if (waitDlg) CloseAlert();
        throw new Error(`HTTP error: ${res.status}`);
      }
      console.log('fetched: ' + url)
      if (waitDlg) CloseAlert();
      return await res.json();
    }

   catch (error : any) {
      Alert('Web error',err,'','error','OK')
    }
  
  }



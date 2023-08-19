import  { Alert,CloseAlert } from './alert'

function quilkinUrlBase() {

    //return "https://www.quilkin.co.uk/routes.svc/";
    return "http://localhost/routes/routes.svc/";

}

//export const myFetch = async(url : String, data : Object, waitDlg : Boolean) => {
export async function myFetch(url : String, data : Object, waitDlg : Boolean)  {

     
  console.log('data: ' + JSON.stringify(data,null,4));
    const bodyData = JSON.stringify(data);
    console.log('body: ' +bodyData);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: bodyData
    }
    if (waitDlg) {
      Alert('Loading','Please wait...','info','');
    }

    const fullUrl = quilkinUrlBase() + url;
    // fetch(fullUrl, options)
    //   .then(res=>res.json()).then((response) => {
    //       Swal.close();
    //       return response;
    //       })
    //   .catch((error) => {
    //       Swal.close();
    //       Swal.fire({
    //         title: 'Web error',
    //         text: error.message,
    //         icon: 'error',
    //         width: '300px',
    //         confirmButtonText: 'OK'
    //       }).then();
    //       return null;
    //     });
    //   }
    let res;
    let err : string;

    try {
      res = await fetch(fullUrl, options);
      if (res.ok) {
        CloseAlert();
        return res.json();
      }
      else {
        err = res.statusText;
      }
    }

   catch (error : any) {

      err = error;
    }
    CloseAlert();
    Alert('Web error',err,'error','OK')
    return null;
 
  }



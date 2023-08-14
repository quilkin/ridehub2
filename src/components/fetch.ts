import Swal from 'sweetalert2'

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
      Swal.fire({
        title: 'Loading',
        text: 'Please wait...',
        icon: 'info',
        width: '300px',
        showConfirmButton: false
      }).then();
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
        Swal.close();
        return res.json();
      }
      else {
        err = res.statusText;
      }
    }

   catch (error : any) {

      err = error;
    }
    Swal.close();
    Swal.fire({
      title: 'Web error',
      text: err,
      icon: 'error',
      confirmButtonText: 'OK'
    }).then();
    return null;
 
  }



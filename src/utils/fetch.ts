import  { Alert, AlertError,CloseAlert } from './alert'

function quilkinUrlBase() {

    //return "https://www.quilkin.co.uk/routes.svc/";
    return "http://localhost/routes/routes.svc/";

}
export enum apiMethods {
  signup = 'Signup',
  login = 'Login',
  changeAccount = 'ChangeAccount',
  forgotPW ='ForgetPassword',
  getRides = 'GetRidesForDate',
  getRoutes = 'GetRoutes',
  getPpts = 'GetParticipants',
  getGpx = 'GetGPXforRoute',
  saveRoute = 'SaveRoute',
  saveRide = 'SaveRide',
  editRide = 'EditRide',
  updateRoute = 'UpdateRoute',
  savePpt = 'SaveParticipant',
  leavePpt= 'LeaveParticipant',
  deleteRide = 'DeleteRide',
  tcx2gpx = 'TCX2GPX'
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
      //console.log('fetched: ' + url)
      if (waitDlg) CloseAlert();
      return await res.json();
    }

   catch (error : any) {
      AlertError('Web error',error)
    }
  
  }



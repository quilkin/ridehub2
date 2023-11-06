import  { Alert, AlertError,CloseAlert } from './alert'
import { serviceBase } from '../../service'

// function quilkinUrlBase() {

//     //return "https://www.quilkin.co.uk/routes.svc/";
//     //return "http://localhost/routes/routes.svc/";
//     return "/Routes.svc/";

// }
// export enum apiMethods {
//   signup = 'Signup',
//   login = 'Login',
//   changeAccount = 'ChangeAccount',
//   forgotPW ='ForgetPassword',
//   getRides = 'GetRidesForDate',  // done
//   getRoutes = 'GetRoutes',        // done
//   getPpts = 'GetParticipants',
//   getGpx = 'GetGPXforRoute',
//   saveRoute = 'SaveRoute',
//   saveRide = 'SaveRide',
//   editRide = 'EditRide',
//   updateRoute = 'UpdateRoute',
//   savePpt = 'SaveParticipant',
//   leavePpt= 'LeaveParticipant',
//   deleteRide = 'DeleteRide',
//   tcx2gpx = 'TCX2GPX',
//   getLogins = 'GetLogins',
//   register = 'Register',
//   checkTimeout = 'CheckTimeout',
//   findUser = 'FindUser'
// }

export async function myFetch(url : String, data : Object | null, waitDlg : Boolean = false, nodeServer : boolean = false)  {

   const bodyData = nodeServer? JSON.stringify({data}) : JSON.stringify(data);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: bodyData
    }
    if (waitDlg)   Alert('Loading','Please wait...','','info','');
    
    console.log('fetch: ' + url)
    const fullUrl = serviceBase(nodeServer) + url;
    let res;

    try {
      if (data==null)
        res = await fetch(fullUrl);
      else
        res = await fetch(fullUrl, options);

      if (!res.ok) {
        if (waitDlg) CloseAlert();
        throw new Error(`HTTP error: ${res.status}`);
      }

      if (waitDlg) CloseAlert();
      // if (nodeServer)
      //   return res;
      return await res.json();
    }

   catch (error : any) {
      await AlertError('Web error',error)
    }
  
  }



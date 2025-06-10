//import { notify } from "@kyvg/vue3-notification";

function quilkinUrlBase() {

    //return "https://www.quilkin.co.uk/routes.svc/";
    return "http://localhost/routes/routes.svc/";

}

export async function serverPost (url = '', data = {}, waitDlg = false) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    if (waitDlg) {
        //$("#pleaseWaitDialog").modal("show");
    }
    var res = '';
    var err ='';
    url = quilkinUrlBase() + url;
    
    try {
        res = await fetch(url, options);
    }
    catch (error) {
        err ="Error with web request: " + error;
    }
    finally {
        if (res.ok === false) {
            err = "Error with web request: " + res.statusText;
        }
    }
    if (waitDlg) {
        //$("#pleaseWaitDialog").modal("hide");
    }
    if (err.length > 0) {
        return err;
        // notify({
        //     title: "Web error",
        //     text: err,
        // });
    }

    return res.json();
   
};
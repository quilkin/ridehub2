import Swal, { type SweetAlertIcon } from 'sweetalert2'

export async function Alert(
  title: string,
  text: string,
  footer: string,
  icon: SweetAlertIcon,
  confirmText : string
) {
  // console.log(title + ' ' + text);
  // return;
  await Swal.fire({
    title: title,
    text: text,
    footer: footer,
    icon: icon,
    width: '300px',
    confirmButtonText: confirmText,
    showConfirmButton: confirmText.length > 0
  }).then();
}

export function CloseAlert() {
  //return;
  Swal.close();
}

export async function Message(
  title: string

) {
   await Swal.fire(title).then();
}
export async function YesNo(
  title: string,
  yesfunc: (() => void) | undefined 

) {
    await Swal.fire({
        title: title,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',

      }) .then((result) => {
        if (result.isConfirmed && yesfunc != undefined) {
          //Swal.fire('ok', '', 'success').then();
          yesfunc();
        } // else if (result.isDenied) {
        //   Swal.fire('Changes are not saved', '', 'info').then();
        // }

    })
}

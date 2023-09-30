import Swal, { type SweetAlertIcon } from 'sweetalert2'

export function Alert(
  title: string,
  text: string,
  footer: string,
  icon: SweetAlertIcon,
  confirmText : string
) {
  // console.log(title + ' ' + text);
  // return;
  Swal.fire({
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


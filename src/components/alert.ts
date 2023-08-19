import Swal, { type SweetAlertIcon } from 'sweetalert2'

export function Alert(
  title: string,
  text: string,
  icon: SweetAlertIcon,
  confirmText : string
) {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    width: '300px',
    confirmButtonText: confirmText,
    showConfirmButton: confirmText.length > 0
  }).then();
}

export function CloseAlert() {
  Swal.close();
}


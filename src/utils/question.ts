import Swal, { type SweetAlertIcon } from 'sweetalert2'

export function YesNo(
  title: string,
  confirmation: string

) {
    Swal.fire({
        title: title,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        // customClass: {
        //   actions: 'my-actions',
        //   cancelButton: 'order-1 right-gap',
        //   confirmButton: 'order-2',
        //   denyButton: 'order-3',
        // }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(confirmation, '', 'success').then();
          return true;
        } else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info').then();
          return false;
        }
      })
      return false;
}
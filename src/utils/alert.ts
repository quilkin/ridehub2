/**
 * Various modal dialogs based on the SweetAlert library
 */


import Swal, { type SweetAlertIcon } from 'sweetalert2'

export async function Alert(
  title: string,
  text: string,
  footer: string,
  icon: SweetAlertIcon,
  confirmText : string
) {

  await Swal.fire({
    title: title,
    text: text,
    footer: footer,
    icon: icon,
    width: '250px',
    confirmButtonText: confirmText,
    showConfirmButton: confirmText.length > 0
  }).then();
}

export async function AlertError(
  title: string,
  text: string,
) {

  await Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    width: '250px',
    confirmButtonText: 'OK',
    showConfirmButton: true
  }).then();
}

export async function LongMessage(
  title: string,
  text: string,
) {

  await Swal.fire({
    title: title,
    text: text,
    width: '250px',
    confirmButtonText: 'OK',
    showConfirmButton: true
  }).then();
}

export function CloseAlert() {
  Swal.close();
}

export async function Message(
  title: string

) {
   await Swal.fire(title).then();
}

/**
 * wait for user to accept or declne message in modal window
 * @param title 
 * @param yesfunc what to do if answered yes
 */
export async function YesNo(
  title: string,
  yesfunc: (() => void) | undefined 

) {
    await Swal.fire({
        title: title,
        showDenyButton: true,
        showCancelButton: true,
        width: '250px',
        confirmButtonText: 'Yes',
        denyButtonText: 'No',

      }) .then((result) => {
        if (result.isConfirmed && yesfunc != undefined) {

          yesfunc();
        } 
    })
}

/**
 * Wait for user to choose between two options
 * @param title 
 * @param choice1 option 1
 * @param choice2 option 2
 * @param func1 what do do if option 1 is chosen
 * @param func2 what do do if option 2 is chosen
 */
export async function chooseFromTwo(
  title: string,
  choice1 : string,
  choice2 : string,

  func1: (() => void) | undefined ,
  func2: (() => void) | undefined 

) {
    await Swal.fire({
        title: title,
        width: '250px',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: choice1,
        denyButtonText: choice2,

      }) .then(async (result) => {
        if (result.isConfirmed && func1 != undefined) {
          await func1();
        } 
        else if (result.isDenied && func2 != undefined) {
          await func2();
        }
    })
}
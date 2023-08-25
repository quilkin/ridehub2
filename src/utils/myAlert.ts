import { renderOverlay } from '@overlays/vue'
import OverlayComponent from '../components/overlay.vue'

export async function myAlert() {
 
const value = await renderOverlay(OverlayComponent, {
  title: 'useOverlay'
})
}
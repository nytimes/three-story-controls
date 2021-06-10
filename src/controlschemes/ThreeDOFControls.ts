import { BaseControls } from './BaseControls'
import { CameraRig, CameraAction } from '../CameraRig'
import { PointerAdaptor } from '../adaptors/PointerAdaptor'

//TODO: add option for relative or absolute control (in terms of screen space)
export interface ThreeDOFControlsProps {
  /* Mutiplier for panning. Defaults to Math.PI / 20 */
  panFactor?: number
  /* Mutiplier for tilting. Defaults to Math.PI / 20 */
  tiltFactor?: number
  /* Mutiplier for truck translation. Defaults to 1 */
  truckFactor?: number
  /* Mutiplier for pedestal translation. Defaults to 1 */
  pedestalFactor?: number
  /* Damping factor between 0 and 1. Defaults to 0.7 */
  dampingFactor?: number
}

/**
 * Control scheme for slight rotation and translation movement in response to mouse movements (designed to be used in conjunction with other control schemes)
 * @example
 * ```js
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new ThreeDOFControls(cameraRig)
 *
 * controls.enable()
 * function animate(t) {
 *  // render loop
 *  controls.update(t)
 * }
 * ```
 */
export class ThreeDOFControls implements BaseControls {
  readonly cameraRig: CameraRig
  private pointerAdaptor: PointerAdaptor
  private enabled = false
  private panFactor = Math.PI / 20
  private tiltFactor = Math.PI / 20
  private truckFactor = 1
  private pedestalFactor = 1
  private dampingFactor = 0.7

  constructor(cameraRig: CameraRig, props: ThreeDOFControlsProps = {}) {
    this.cameraRig = cameraRig
    Object.assign(this, props)
    this.pointerAdaptor = new PointerAdaptor({
      dampingFactor: this.dampingFactor,
    })
    this.onPointerMove = this.onPointerMove.bind(this)
  }

  isEnabled(): boolean {
    return this.enabled
  }

  enable(): void {
    this.pointerAdaptor.connect()
    this.pointerAdaptor.addEventListener('update', this.onPointerMove)
    this.enabled = true
  }

  disable(): void {
    this.pointerAdaptor.disconnect()
    this.pointerAdaptor.removeEventListener('update', this.onPointerMove)
    this.enabled = false
  }

  update(time: number): void {
    if (this.enabled) {
      this.pointerAdaptor.update(time)
    }
  }

  private onPointerMove(event): void {
    if (event.pointerCount === 0) {
      this.cameraRig.do(CameraAction.Pan, -event.deltas.x * this.panFactor)
      this.cameraRig.do(CameraAction.Tilt, -event.deltas.y * this.tiltFactor)
      this.cameraRig.do(CameraAction.LocalTruck, event.deltas.x * this.truckFactor)
      this.cameraRig.do(CameraAction.LocalPedestal, event.deltas.y * this.pedestalFactor)
    }
  }
}

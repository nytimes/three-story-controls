import { BaseControls } from './BaseControls'
import { CameraRig, CameraAction, RigComponent } from '../CameraRig'
import { PointerAdaptor } from '../adaptors/PointerAdaptor'

/**
 * Properties that can be passed to the {@link three-story-controls#ThreeDOFControls} constructor
 */
//TODO: add option for relative or absolute control (in terms of screen space)
export interface ThreeDOFControlsProps {
  /** DOM element that should listen for pointer events. Defaults to `document.body` */
  domElement?: HTMLElement
  /** Mutiplier for panning. Defaults to Math.PI / 20 */
  panFactor?: number
  /** Mutiplier for tilting. Defaults to Math.PI / 20 */
  tiltFactor?: number
  /** Mutiplier for truck translation. Defaults to 1 */
  truckFactor?: number
  /** Mutiplier for pedestal translation. Defaults to 1 */
  pedestalFactor?: number
  /** Damping factor between 0 and 1. Defaults to 0.7 */
  dampingFactor?: number
}

const defaultProps: ThreeDOFControlsProps = {
  domElement: document.body,
  panFactor: Math.PI / 20,
  tiltFactor: Math.PI / 20,
  truckFactor: 1,
  pedestalFactor: 1,
  dampingFactor: 0.7,
}

/**
 * Control scheme for slight rotation and translation movement in response to mouse movements (designed to be used in conjunction with other control schemes)
 * @remarks
 * Note: CSS property `touch-action: none` will probably be needed on listener element
 *
 * See {@link three-story-controls#ThreeDOFControlsProps} for all properties that can be passed to the constructor.
 *
 * {@link https://nytimes.github.io/three-story-controls/examples/demos/story-points/ | DEMO w/ story points }
 *
 * {@link https://nytimes.github.io/three-story-controls/examples/demos/scroll-controls/ | DEMO w/ scroll controls}
 *
 * @example
 * ```js
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new ThreeDOFControls(cameraRig)
 *
 * controls.enable()
 *
 * // render loop
 * function animate(t) {
 *  controls.update(t)
 * }
 * ```
 */
export class ThreeDOFControls implements BaseControls {
  readonly cameraRig: CameraRig
  private pointerAdaptor: PointerAdaptor
  private enabled = false
  private panFactor: number
  private tiltFactor: number
  private truckFactor: number
  private pedestalFactor: number

  constructor(cameraRig: CameraRig, props: ThreeDOFControlsProps = {}) {
    this.cameraRig = cameraRig
    Object.assign(this, defaultProps, props)
    this.pointerAdaptor = new PointerAdaptor({
      domElement: props.domElement || defaultProps.domElement,
      dampingFactor: props.dampingFactor || defaultProps.dampingFactor,
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
      this.cameraRig.do(CameraAction.Pan, -event.deltas.x * this.panFactor, RigComponent.Eyes)
      this.cameraRig.do(CameraAction.Tilt, -event.deltas.y * this.tiltFactor, RigComponent.Eyes)
      this.cameraRig.do(CameraAction.Truck, event.deltas.x * this.truckFactor, RigComponent.Eyes)
      this.cameraRig.do(CameraAction.Pedestal, event.deltas.y * this.pedestalFactor, RigComponent.Eyes)
    }
  }
}

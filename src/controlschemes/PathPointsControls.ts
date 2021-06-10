import { EventDispatcher } from 'three'
import { BaseControls } from './BaseControls'
import { CameraRig } from '../CameraRig'
import { KeyboardAdaptor } from '../adaptors/KeyboardAdaptor'
import { WheelAdaptor } from '../adaptors/WheelAdaptor'
import { SwipeAdaptor } from '../adaptors/SwipeAdaptor'

export interface PathPointMarker {
  frame: number
}
/**
 * Payload signature for event fired on user input when there
 * is no next/prev POI to go to
 * */
export interface ExitPathPointsEvent {
  type: 'ExitPathPoints'
  exitFrom: 'start' | 'end'
}

export interface PathPointsControlsProps {
  /** Threshold of wheel delta that triggers a transition. Defaults to 15 */
  wheelThreshold?: number
  /** Threshold of swipe distance that triggers a transition. Defaults to 60 */
  swipeThreshold?: number
  /** Transition duration, defaults to 1 */
  duration?: number
  /** Transition easing, defaults to power1 */
  ease?: string
}

/**
 * Control scheme to transition the camera between specific points (frames) along a path specified through an `AnimationClip`.
 * @example
 * ```js
 *
 * const pois = [ { frame: 0 }, { frame: 54 } ....]
 * const scene = new Scene()
 * const gltfLoader = new GLTFLoader()
 * let camera, cameraRig, controls
 *
 * gltfLoader.load(cameraPath, (gltf) => {
 *  camera = gltf.cameras[0]
 *  cameraRig = new CameraRig(gltf.cameras[0], scene, { animationClip: gltf.animations[0] })
 *  controls = new PathPointsControls(cameraRig, pois)
 *  pois[0].show(1)
 *  controls.enable()
 *  controls.addEventListener('ExitPathPoints', (e) => {
 *    alert(`Exit path points from _${e.exitFrom}_ event fired`)
 *  })
 * })
 * ```
 */
export class PathPointsControls extends EventDispatcher implements BaseControls {
  readonly cameraRig: CameraRig
  private wheelAdaptor: WheelAdaptor
  private swipeAdaptor: SwipeAdaptor
  private keyboardAdaptor: KeyboardAdaptor
  private pois: PathPointMarker[]
  private currentIndex = 0
  private upcomingIndex: number | null = null
  private enabled = false
  private duration: number
  private ease: string
  private wheelThreshold = 15
  private swipeThreshold = 60

  constructor(cameraRig: CameraRig, pois: PathPointMarker[] = [], props: PathPointsControlsProps = {}) {
    super()
    this.cameraRig = cameraRig
    this.pois = pois
    Object.assign(this, props)
    this.wheelAdaptor = new WheelAdaptor({ type: 'discrete', thresholdY: this.wheelThreshold })
    this.swipeAdaptor = new SwipeAdaptor({ thresholdY: this.swipeThreshold })
    this.keyboardAdaptor = new KeyboardAdaptor({ type: 'discrete' })
    this.onCameraStart = this.onCameraStart.bind(this)
    this.onCameraUpdate = this.onCameraUpdate.bind(this)
    this.onCameraEnd = this.onCameraEnd.bind(this)
    this.onTrigger = this.onTrigger.bind(this)
    this.onKey = this.onKey.bind(this)
  }

  getCurrentIndex(): number {
    return this.currentIndex
  }

  enable(): void {
    this.wheelAdaptor.addEventListener('trigger', this.onTrigger)
    this.swipeAdaptor.addEventListener('trigger', this.onTrigger)
    this.keyboardAdaptor.addEventListener('trigger', this.onKey)
    this.cameraRig.addEventListener('CameraMoveStart', this.onCameraStart)
    this.cameraRig.addEventListener('CameraMoveUpdate', this.onCameraUpdate)
    this.cameraRig.addEventListener('CameraMoveEnd', this.onCameraEnd)
    this.wheelAdaptor.connect()
    this.swipeAdaptor.connect()
    this.keyboardAdaptor.connect()
    this.enabled = true
  }

  disable(): void {
    this.wheelAdaptor.removeEventListener('trigger', this.onTrigger)
    this.swipeAdaptor.removeEventListener('trigger', this.onTrigger)
    this.keyboardAdaptor.removeEventListener('trigger', this.onKey)
    this.cameraRig.removeEventListener('CameraMoveStart', this.onCameraStart)
    this.cameraRig.removeEventListener('CameraMoveUpdate', this.onCameraUpdate)
    this.cameraRig.removeEventListener('CameraMoveEnd', this.onCameraEnd)
    this.wheelAdaptor.disconnect()
    this.swipeAdaptor.disconnect()
    this.keyboardAdaptor.disconnect()
    this.enabled = false
  }

  update(): void {
    // nothing to do here
  }

  isEnabled(): boolean {
    return this.enabled
  }

  private onKey(event): void {
    switch (event.trigger) {
      case 'up':
        this.onTrigger({ y: -1 })
        break
      case 'down':
        this.onTrigger({ y: 1 })
        break
      default:
        break
    }
  }

  private onTrigger(event): void {
    const index = this.currentIndex + event.y
    if (index >= this.pois.length) {
      this.dispatchEvent({
        type: 'ExitPathPoints',
        exitFrom: 'end',
      } as ExitPathPointsEvent)
    } else if (index < 0) {
      this.dispatchEvent({
        type: 'ExitPathPoints',
        exitFrom: 'start',
      } as ExitPathPointsEvent)
    } else {
      this.upcomingIndex = index
      this.cameraRig.flyToKeyframe(this.pois[this.upcomingIndex].frame, this.duration, this.ease)
    }
  }

  private updatePois(progress: number): void {
    this.dispatchEvent({
      type: 'update',
      currentIndex: this.currentIndex,
      upcomingIndex: this.upcomingIndex,
      progress,
    })
  }

  private onCameraStart(): void {
    this.updatePois(0)
  }

  private onCameraUpdate(event): void {
    this.updatePois(event.progress)
  }

  private onCameraEnd(): void {
    this.currentIndex = this.upcomingIndex
    this.upcomingIndex = null
  }
}

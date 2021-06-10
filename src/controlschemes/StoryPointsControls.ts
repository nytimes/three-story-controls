import { EventDispatcher, Vector3, Quaternion } from 'three'
import { BaseControls } from './BaseControls'
import { CameraRig } from '../CameraRig'

export interface StoryPointMarker {
  lookAtPosition: Vector3
  lookAtOrientation: Quaternion
}

/**
 * Payload signature for event fired when nextPOI/prevPOI are invoked
 * when at last/first POI (ie there is no POI to go to)
 * */
export interface ExitStoryPointsEvent {
  type: 'ExitStoryPoints'
  exitFrom: 'start' | 'end'
}

export interface StoryPointsControlsProps {
  /**
   * Whether to cycle to the first/last POI after reaching the end/start.
   * When false, controls with emit 'ExitStoryPoints' events. Defaults to false.
   * */
  cycle?: boolean
  /** Transition duration, defaults to 1 */
  duration?: number
  /** Transition easing, defaults to power1 */
  ease?: string
}

/**
 * Control scheme to transition the camera between given points in world space.
 * @example
 * ```js
 *
 * const pois = [
 *  { lookAtPosition: new Vector3(...), lookAtOrientation: new Quaternion(...) },
 *  { lookAtPosition: new Vector3(...), lookAtOrientation: new Quaternion(...) },
 * ]
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new StoryPointsControls(cameraRig, pois)
 *
 * controls.enable()
 * controls.goToPOI(0)
 * controls.addEventListener('ExitStoryPoints', (e) => {
 *  alert(`Exit story points from _${e.exitFrom}_ event fired`)
 * })
 *
 * // assuming some 'nextBtn' and 'prevBtn' dom elements have been created
 * nextBtn.on('click', () => controls.nextPOI() )
 * prevBtn.on('click', () => controls.prevPOI() )
 * ```
 */
export class StoryPointsControls extends EventDispatcher implements BaseControls {
  readonly cameraRig: CameraRig
  private pois: StoryPointMarker[]
  private currentIndex: number | null = null
  private upcomingIndex: number | null = null
  private enabled = false
  private cycle = false
  private duration: number
  private ease: string

  constructor(cameraRig: CameraRig, pois: StoryPointMarker[] = [], props: StoryPointsControlsProps = {}) {
    super()
    this.cameraRig = cameraRig
    this.pois = pois
    Object.assign(this, props)
    this.onCameraStart = this.onCameraStart.bind(this)
    this.onCameraUpdate = this.onCameraUpdate.bind(this)
    this.onCameraEnd = this.onCameraEnd.bind(this)
  }

  getCurrentIndex(): number {
    return this.currentIndex
  }

  nextPOI(): void {
    const next = this.currentIndex + 1
    if (next >= this.pois.length && !this.cycle) {
      this.dispatchEvent({
        type: 'ExitStoryPoints',
        exitFrom: 'end',
      } as ExitStoryPointsEvent)
    } else {
      this.goToPOI(next % this.pois.length)
    }
  }

  prevPOI(): void {
    const prev = this.currentIndex - 1
    if (prev < 0 && !this.cycle) {
      this.dispatchEvent({
        type: 'ExitStoryPoints',
        exitFrom: 'start',
      } as ExitStoryPointsEvent)
    } else {
      this.goToPOI((prev + this.pois.length) % this.pois.length)
    }
  }

  goToPOI(index: number): void {
    this.upcomingIndex = index
    const poi = this.pois[this.upcomingIndex]
    this.cameraRig.flyTo(poi.lookAtPosition, poi.lookAtOrientation, this.duration, this.ease)
  }

  enable(): void {
    this.cameraRig.addEventListener('CameraMoveStart', this.onCameraStart)
    this.cameraRig.addEventListener('CameraMoveUpdate', this.onCameraUpdate)
    this.cameraRig.addEventListener('CameraMoveEnd', this.onCameraEnd)
    this.enabled = true
  }

  disable(): void {
    this.cameraRig.removeEventListener('CameraMoveStart', this.onCameraStart)
    this.cameraRig.removeEventListener('CameraMoveUpdate', this.onCameraUpdate)
    this.cameraRig.removeEventListener('CameraMoveEnd', this.onCameraEnd)
    this.enabled = false
  }

  update(): void {
    // nothing to do here
  }

  isEnabled(): boolean {
    return this.enabled
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

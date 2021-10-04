import { EventDispatcher, Vector3, Quaternion } from 'three'
import { BaseControls, UpdatePOIsEvent, ExitPOIsEvent } from './BaseControls'
import { KeyboardAdaptor } from '../adaptors/KeyboardAdaptor'
import { CameraRig } from '../CameraRig'

export interface StoryPointMarker {
  /** Camera position */
  position: Vector3
  /** Camera quaternion */
  quaternion: Quaternion
  /** Transition duration, defaults to 1 */
  duration?: number
  /** Transition easing, defaults to power1 */
  ease?: string
  /** Use spherical interpolation for rotation, defaults to true */
  useSlerp?: boolean
}

/**
 * Properties that can be passed to the {@link three-story-controls#StoryPointsControls} constructor
 */
export interface StoryPointsControlsProps {
  /** Whether to cycle to the first/last POI after reaching the end/start. When false, controls with emit 'ExitStoryPoints' events. Defaults to false. */
  cycle?: boolean
  /** Use keyboard arrow keys as navigation, defaults to true */
  useKeyboard?: boolean
}

const defaultProps: StoryPointsControlsProps = {
  cycle: false,
  useKeyboard: true,
}

/**
 * Control scheme to transition the camera between given points in world space.
 * @remarks
 * See {@link three-story-controls#StoryPointsControlsProps} for all properties that can be passed to the constructor.
 *
 * See {@link three-story-controls#StoryPointMarker} for POI properties.
 *
 * {@link https://nytimes.github.io/three-story-controls/examples/demos/story-points/ | DEMO }
 *
 * @example
 * ```js
 *
 * const pois = [
 *  { position: new Vector3(...), quaternion: new Quaternion(...) },
 *  { position: new Vector3(...), quaternion: new Quaternion(...) },
 * ]
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new StoryPointsControls(cameraRig, pois)
 *
 * controls.enable()
 * controls.goToPOI(0)
 *
 * // Assuming DOM elements with classes 'nextBtn' and 'prevBtn' have been created
 * document.querySelector('.nextBtn').on('click', () => controls.nextPOI() )
 * document.querySelector('.prevBtn').on('click', () => controls.prevPOI() )
 * ```
 */
export class StoryPointsControls extends EventDispatcher implements BaseControls {
  readonly cameraRig: CameraRig
  private keyboardAdaptor: KeyboardAdaptor
  private pois: StoryPointMarker[]
  private currentIndex: number | null = null
  private upcomingIndex: number | null = null
  private enabled = false
  private cycle: boolean
  private useKeyboard: boolean

  constructor(cameraRig: CameraRig, pois: StoryPointMarker[] = [], props: StoryPointsControlsProps = {}) {
    super()
    this.cameraRig = cameraRig
    this.pois = pois
    Object.assign(this, defaultProps, props)
    if (this.useKeyboard) {
      this.keyboardAdaptor = new KeyboardAdaptor({
        type: 'discrete',
        keyMapping: {
          next: ['ArrowDown', 'ArrowRight'],
          prev: ['ArrowUp', 'ArrowLeft'],
        },
      })
      this.onKey = this.onKey.bind(this)
    }
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
        type: 'ExitPOIs',
        exitFrom: 'end',
      } as ExitPOIsEvent)
    } else {
      this.goToPOI(next % this.pois.length)
    }
  }

  prevPOI(): void {
    const prev = this.currentIndex - 1
    if (prev < 0 && !this.cycle) {
      this.dispatchEvent({
        type: 'ExitPOIs',
        exitFrom: 'start',
      } as ExitPOIsEvent)
    } else {
      this.goToPOI((prev + this.pois.length) % this.pois.length)
    }
  }

  goToPOI(index: number): void {
    this.upcomingIndex = index
    const poi = this.pois[this.upcomingIndex]
    this.cameraRig.flyTo(poi.position, poi.quaternion, poi.duration, poi.ease, poi.useSlerp)
  }

  enable(): void {
    if (this.useKeyboard) {
      this.keyboardAdaptor.connect()
      this.keyboardAdaptor.addEventListener('trigger', this.onKey)
    }
    this.cameraRig.addEventListener('CameraMoveStart', this.onCameraStart)
    this.cameraRig.addEventListener('CameraMoveUpdate', this.onCameraUpdate)
    this.cameraRig.addEventListener('CameraMoveEnd', this.onCameraEnd)
    this.enabled = true
  }

  disable(): void {
    if (this.useKeyboard) {
      this.keyboardAdaptor.disconnect()
      this.keyboardAdaptor.removeEventListener('trigger', this.onKey)
    }
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
    } as UpdatePOIsEvent)
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

  private onKey(event): void {
    if (event.trigger === 'next') {
      this.nextPOI()
    } else if (event.trigger === 'prev') {
      this.prevPOI()
    }
  }
}

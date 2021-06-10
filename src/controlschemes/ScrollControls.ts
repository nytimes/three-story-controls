import { BaseControls } from './BaseControls'
import { CameraRig } from '../CameraRig'
import { ScrollAdaptor } from '../adaptors/ScrollAdaptor'

export interface ScrollControlsProps {
  scrollElement: HTMLElement
  scrollParent?: HTMLElement
  dampingFactor?: number
}

/**
 * Control scheme to scrub through the CameraRig's `AnimationClip` based on the scroll of a DOM Element
 * @example
 * ```js
 * const scene = new Scene()
 * const gltfLoader = new GLTFLoader()
 * let camera, cameraRig, controls
 *
 * gltfLoader.load(cameraPath, (gltf) => {
 *  camera = gltf.cameras[0]
 *  cameraRig = new CameraRig(gltf.cameras[0], scene, { animationClip: gltf.animations[0] })
 *  controls = new ScrollControls(cameraRig, {
 *    scrollElement: document.querySelector('.scroller')
 *  })
 *  controls.enable()
 * })
 *
 * function animate() {
 *  // render loop
 *  controls.update()
 * }
 * ```
 */
export class ScrollControls implements BaseControls {
  readonly cameraRig: CameraRig
  private scrollAdaptor: ScrollAdaptor
  private enabled = false

  constructor(cameraRig: CameraRig, props: ScrollControlsProps) {
    this.cameraRig = cameraRig
    this.cameraRig.setAnimationTime(0)

    this.scrollAdaptor = new ScrollAdaptor({
      scrollElement: props.scrollElement,
      scrollParent: props.scrollParent,
      dampingFactor: props.dampingFactor || 1,
    })

    this.onScroll = this.onScroll.bind(this)
  }

  isEnabled(): boolean {
    return this.enabled
  }

  enable(): void {
    this.scrollAdaptor.connect()
    this.scrollAdaptor.addEventListener('update', this.onScroll)
    this.enabled = true
  }

  disable(): void {
    this.scrollAdaptor.disconnect()
    this.scrollAdaptor.removeEventListener('update', this.onScroll)
    this.enabled = false
  }

  update(): void {
    if (this.enabled) {
      this.scrollAdaptor.update()
    }
  }

  private onScroll(event): void {
    this.cameraRig.setAnimationPercentage(event.values.total)
  }
}

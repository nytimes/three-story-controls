import { Quaternion, Vector3, AnimationClip, VectorKeyframeTrack, QuaternionKeyframeTrack } from 'three'
import gsap from 'gsap'
import { CameraRig } from '../CameraRig'
import { FreeMovementControls } from '../controlschemes/FreeMovementControls'
import './index.css'

const easeFunctions = ['none', 'power1', 'power2', 'power3', 'power4', 'sine', 'expo', 'circ']

interface POI {
  position: Vector3
  quaternion: Quaternion
  duration: number
  ease: string
  image: string
}

const DOMClass = {
  visit: 'visit',
  remove: 'remove',
  duration: 'duration',
  ease: 'ease',
  moveUp: 'move-up',
  moveDown: 'move-down',
}

/**
 * A helper tool for creating camera animation paths and/or choosing camera look-at positions for points of interest in a scene
 *
 * @remarks
 * A helper tool for creating camera animation paths and/or choosing camera look-at positions for points of interest in a scene.
 *
 * The `CameraHelper` can be set up with any scene along with {@link three-story-controls#FreeMovementControls | FreeMovementControls}.
 *
 * It renders as an overlay with functionality to add/remove/reorders points of interest, and create an animation path between them.
 *  Each saved camera position is displayed with an image on the `CameraHelper` panel.
 *
 * The data can be exported as a JSON file that can then be used with different control schemes.
 *
 * {@link https://nytimes.github.io/three-story-controls/examples/demos/camera-helper | DEMO }
 *
 * @example
 * Here's an example of initializing the CameraHelper
 * ```js
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new FreeMovementControls(cameraRig)
 *
 * controls.enable()
 *
 * const cameraHelper = new CameraHelper(rig, controls, renderer.domElement)
 *
 * // Render loop
 * // To allow for capturing an image of the canvas,
 * // it's important to update the CameraHelper after the scene is rendered,
 * // but before requesting the animation frame
 * function render(t) {
 *   controls.update(t)
 *   renderer.render(scene, camera)
 *   cameraHelper.update(t)
 *   window.requestAnimationFrame(render)
 * }
 *
 * render()
 * ```
 *
 *
 *
 * The following examples demonstrate using the exported data. Note: Depending on your setup, you may need to change the .json extension to .js and prepend the text with `export default` such that you can import it as javascript
 *
 * @example
 * Here's an example using the exported JSON data with ScrollControls.
 * ```javascript
 * import * as cameraData from 'camera-control.json'
 * const scene = new Scene()
 * const gltfLoader = new GLTFLoader()
 * const camera = new PerspectiveCamera()
 * const cameraRig = new CameraRig(camera, scene)
 *
 * // Parse the JSON animation clip
 * cameraRig.setAnimationClip(AnimationClip.parse(cameraData.animationClip))
 * cameraRig.setAnimationTime(0)
 *
 * const controls = new ScrollControls(cameraRig, {
 *  scrollElement: document.querySelector('.scroller'),
 * })
 *
 * controls.enable()
 *
 * function render(t) {
 *   window.requestAnimationFrame(render)
 *   if (rig.hasAnimation) {
 *     controls.update(t)
 *   }
 *   renderer.render(scene, camera)
 * }
 * ```
 *
 * @example
 * Here's an example using the exported data with Story Point controls
 * ```javascript
 * import * as cameraData from 'camera-control.json'
 * const scene = new Scene()
 * const gltfLoader = new GLTFLoader()
 * const camera = new PerspectiveCamera()
 * const cameraRig = new CameraRig(camera, scene)
 *
 * // Format the exported data to create three.js Vector and Quaternions
 * const pois = cameraData.pois.map((poi, i) => {
 *   return {
 *     position: new Vector3(...poi.position),
 *     quaternion: new Quaternion(...poi.quaternion),
 *     duration: poi.duration,
 *     ease: poi.ease,
 *   }
 * })
 *
 * const controls = new StoryPointsControls(rig, pois)
 * controls.enable()
 *
 * function render(t) {
 *   window.requestAnimationFrame(render)
 *   controls.update(t)
 *   renderer.render(scene, camera)
 * }
 * ```
 */
export class CameraHelper {
  readonly rig: CameraRig
  readonly controls: FreeMovementControls
  readonly canvas: HTMLCanvasElement
  private pois: POI[]
  private currentIndex: number | null
  private drawer: HTMLElement
  private domList: HTMLElement
  private collapseBtn: HTMLElement
  private fileInput: HTMLInputElement
  private btnImport: HTMLElement
  private doCapture: boolean
  private animationClip: AnimationClip
  private isPlaying: boolean
  private playStartTime: number
  private useSlerp = true

  constructor(rig: CameraRig, controls: FreeMovementControls, canvas: HTMLCanvasElement, canvasParent?: HTMLElement) {
    this.rig = rig
    this.controls = controls
    this.canvas = canvas
    this.pois = []
    this.currentIndex = null
    this.doCapture = false
    this.isPlaying = false
    this.initUI(canvasParent)
  }

  private capture(): void {
    this.doCapture = true
  }

  update(time: number): void {
    if (this.doCapture) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 640
      canvas.height = 360
      ctx.drawImage(this.canvas, 0, 0, canvas.width, canvas.height)
      const image = canvas.toDataURL()

      this.addPoi(image)
      this.doCapture = false
    }
    if (this.isPlaying) {
      if (!this.playStartTime) {
        this.playStartTime = time
        this.controls.disable()
        this.rig.packTransform()
      }
      const t = (time - this.playStartTime) / 1000
      this.rig.setAnimationTime(t)
      if (t > this.animationClip.duration) {
        this.isPlaying = false
        this.playStartTime = null
        this.controls.enable()
        this.rig.unpackTransform()
      }
    }
  }

  private addPoi(image: string): void {
    this.pois.push({
      ...this.rig.getWorldCoordinates(),
      duration: 1,
      ease: 'power1',
      image,
    })
    this.currentIndex = this.pois.length - 1
    this.createClip()
    this.render()
  }

  private updatePoi(index: number, props: Partial<POI>): void {
    this.pois[index] = {
      ...this.pois[index],
      ...props,
    }
  }

  private movePoi(index: number, direction: number): void {
    if (index + direction >= 0 && index + direction < this.pois.length) {
      const temp = this.pois[index]
      this.pois[index] = this.pois[index + direction]
      this.pois[index + direction] = temp
      this.render()
    }
  }

  private removePoi(index: number): void {
    this.pois.splice(index, 1)
    this.render()
  }

  private goToPoi(index: number): void {
    const poi = this.pois[index]
    this.rig.flyTo(poi.position, poi.quaternion, poi.duration, poi.ease, this.useSlerp)
  }

  private createClip(): void {
    if (this.pois.length > 0) {
      const times = []
      const positionValues = []
      const quaternionValues = []
      const tmpPosition = new Vector3()
      const tmpQuaternion = new Quaternion()
      const framesPerPoi = 10

      let tweenStartTime = 0

      // transform imported arrays to quaternions and vector3 when loading a camera file
      if (!this.pois[0].quaternion.isQuaternion && !this.pois[0].position.isVector3) {
        for (let i = 0; i < this.pois.length; i++) {
          const p = this.pois[i]
          p.quaternion = new Quaternion(p.quaternion[0], p.quaternion[1], p.quaternion[2], p.quaternion[3])
          p.position = new Vector3(p.position[0], p.position[1], p.position[2])
        }
      }

      for (let i = 0; i < this.pois.length - 1; i++) {
        const p1 = this.pois[i]
        const p2 = this.pois[i + 1]

        const values = {
          px: p1.position.x,
          py: p1.position.y,
          pz: p1.position.z,
          qx: p1.quaternion.x,
          qy: p1.quaternion.y,
          qz: p1.quaternion.z,
          qw: p1.quaternion.w,
          slerpAmount: 0,
        }

        const target = {
          px: p2.position.x,
          py: p2.position.y,
          pz: p2.position.z,
          qx: p2.quaternion.x,
          qy: p2.quaternion.y,
          qz: p2.quaternion.z,
          qw: p2.quaternion.w,
          slerpAmount: 1,
          duration: p2.duration,
          ease: p2.ease,
        }

        const tween = gsap.to(values, target)

        for (let j = 0; j < framesPerPoi; j++) {
          const lerpAmount = p2.duration * (j / framesPerPoi)
          times.push(tweenStartTime + lerpAmount)
          tween.seek(lerpAmount)
          if (this.useSlerp) {
            tmpQuaternion.slerpQuaternions(p1.quaternion, p2.quaternion, values.slerpAmount)
          } else {
            tmpQuaternion.set(values.qx, values.qy, values.qz, values.qw)
          }
          tmpPosition.set(values.px, values.py, values.pz)
          tmpQuaternion.toArray(quaternionValues, quaternionValues.length)
          tmpPosition.toArray(positionValues, positionValues.length)
        }
        tweenStartTime += p2.duration
      }
      // add last point
      const last = this.pois[this.pois.length - 1]
      last.quaternion.toArray(quaternionValues, quaternionValues.length)
      last.position.toArray(positionValues, positionValues.length)
      times.push(tweenStartTime)
      this.animationClip = new AnimationClip(null, tweenStartTime, [
        new VectorKeyframeTrack('Translation.position', times, positionValues),
        new QuaternionKeyframeTrack('Rotation.quaternion', times, quaternionValues),
      ])
      this.rig.setAnimationClip(this.animationClip)
    }
  }

  private scrubClip(amount: number): void {
    if (this.pois.length > 0) {
      this.rig.setAnimationPercentage(amount)
    }
  }

  private playClip(): void {
    if (this.pois.length > 0) {
      this.isPlaying = true
    }
  }

  private import(): void {
    if (this.fileInput) {
      this.fileInput.click()
      const reader = new FileReader()

      this.fileInput.onchange = () => {
        reader.readAsText(this.fileInput.files[0])
        reader.onload = (e) => {
          const parsed = JSON.parse(<string>e.target.result)
          this.pois = parsed.pois
          this.animationClip = parsed.animationClip
          this.createClip()
          this.render()
        }
      }
    }
  }

  private export({ draft }): void {
    if (this.pois.length > 0) {
      const jsondata = {} as any
      jsondata.pois = this.pois.map((poi) => {
        const position = [poi.position.x, poi.position.y, poi.position.z]
        const quaternion = [poi.quaternion.x, poi.quaternion.y, poi.quaternion.z, poi.quaternion.w]
        const obj = {
          position,
          quaternion,
          duration: poi.duration,
          ease: poi.ease,
        } as any

        if (draft) {
          obj.image = poi.image
        }

        return obj
      })
      if (this.animationClip) {
        jsondata.animationClip = AnimationClip.toJSON(this.animationClip)
      }
      const data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsondata))
      const a = document.createElement('a')
      a.href = 'data:' + data
      a.download = `camera-data${draft ? '-draft' : ''}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }

  private exportImages(): void {
    const link = document.createElement('a')
    document.body.appendChild(link)
    this.pois.forEach((poi, index) => {
      link.href = poi.image
      link.download = `camera-poi-${index}.png`
      link.click()
    })
    link.remove()
  }

  // ui

  private initUI(canvasParent?: HTMLElement): void {
    this.drawer = document.createElement('div')
    this.drawer.classList.add('tb-ch')

    const btnAdd = document.createElement('button')
    btnAdd.classList.add('btn-round', 'add')
    btnAdd.innerText = '+'
    btnAdd.onclick = this.capture.bind(this)

    this.collapseBtn = document.createElement('button')
    this.collapseBtn.classList.add('btn-round', 'collapse')
    this.collapseBtn.innerText = '<'
    this.collapseBtn.onclick = this.collapse.bind(this)

    const controlWrapper = document.createElement('div')
    controlWrapper.classList.add('controls')

    this.fileInput = document.createElement('input')
    this.fileInput.type = 'file'
    this.fileInput.id = 'import'
    this.fileInput.accept = 'application/json'
    this.fileInput.style.display = 'none'

    this.btnImport = document.createElement('button')
    this.btnImport.classList.add('btn-text', 'import')
    this.btnImport.innerText = 'import draft JSON'
    this.btnImport.onclick = this.import.bind(this)

    const btnExportImages = document.createElement('button')
    btnExportImages.classList.add('btn-text', 'export')
    btnExportImages.innerText = 'export draft JSON'
    btnExportImages.onclick = this.export.bind(this, { draft: true })

    const btnExport = document.createElement('button')
    btnExport.classList.add('btn-text', 'export')
    btnExport.innerText = 'export production JSON'
    btnExport.onclick = this.export.bind(this, { draft: false })

    const bntExportImages = document.createElement('button')
    bntExportImages.classList.add('btn-text', 'export-images')
    bntExportImages.innerHTML = 'export images'
    bntExportImages.onclick = this.exportImages.bind(this)

    const btnPlay = document.createElement('button')
    btnPlay.classList.add('btn-text', 'play')
    btnPlay.innerText = 'play'
    btnPlay.onclick = this.playClip.bind(this)

    const sliderTime: HTMLInputElement = document.createElement('input')
    sliderTime.type = 'range'
    sliderTime.min = '0'
    sliderTime.max = '1000'
    sliderTime.step = '0.1'
    sliderTime.value = '0'
    const updateTime = this.scrubClip.bind(this)
    sliderTime.onmousedown = () => this.rig.packTransform()
    sliderTime.onmouseup = () => this.rig.unpackTransform()
    sliderTime.oninput = (e) => updateTime(parseInt((<HTMLInputElement>e.target).value) / 1000)

    this.domList = document.createElement('div')
    this.domList.classList.add('pois')
    this.domList.onclick = this.handleEvents.bind(this)
    this.domList.onchange = this.handleEvents.bind(this)

    controlWrapper.append(
      this.fileInput,
      this.btnImport,
      btnPlay,
      sliderTime,
      bntExportImages,
      btnExportImages,
      btnExport,
    )
    this.drawer.append(btnAdd, this.collapseBtn, this.domList, controlWrapper)

    const parent = canvasParent || document.body
    parent.append(this.drawer)
  }

  private handleEvents(event): void {
    const index = event.target.dataset.index
    if (index) {
      if (event.target.classList.contains(DOMClass.visit)) {
        this.goToPoi(parseInt(index))
      } else if (event.target.classList.contains(DOMClass.remove)) {
        this.removePoi(parseInt(index))
      } else if (event.target.classList.contains(DOMClass.duration)) {
        this.updatePoi(parseInt(index), { duration: parseFloat((<HTMLInputElement>event.target).value) })
      } else if (event.target.classList.contains(DOMClass.ease)) {
        this.updatePoi(parseInt(index), { ease: (<HTMLSelectElement>event.target).value })
      } else if (event.target.classList.contains(DOMClass.moveUp)) {
        this.movePoi(parseInt(index), -1)
      } else if (event.target.classList.contains(DOMClass.moveDown)) {
        this.movePoi(parseInt(index), 1)
      }
      this.createClip()
    }
  }

  private collapse(): void {
    if (this.drawer.classList.contains('collapsed')) {
      this.drawer.classList.remove('collapsed')
      this.collapseBtn.innerText = '<'
    } else {
      this.drawer.classList.add('collapsed')
      this.collapseBtn.innerText = '>'
    }
  }

  private render(): void {
    this.domList.innerHTML = ''
    this.pois.forEach((poi, index) => {
      const div = document.createElement('div')
      div.classList.add('poi')

      const textHeading = document.createElement('h2')
      textHeading.innerText = `${index + 1}.`

      const wrapper = document.createElement('div')
      wrapper.classList.add('wrapper')
      const controls = document.createElement('div')
      controls.classList.add('poi-controls')
      const params = document.createElement('div')
      params.classList.add('poi-params')

      const image = new Image()
      image.src = poi.image

      const labelDuration = document.createElement('label')
      labelDuration.innerText = 'Duration'
      const inputDuration = document.createElement('input')
      inputDuration.classList.add(DOMClass.duration)
      inputDuration.dataset.index = `${index}`
      inputDuration.type = 'number'
      inputDuration.value = String(poi.duration)

      const labelEase = document.createElement('label')
      labelEase.innerText = 'Easing'
      const selectEase = document.createElement('select')
      selectEase.classList.add(DOMClass.ease)
      selectEase.dataset.index = `${index}`
      const options = easeFunctions.map((x) => {
        const op = document.createElement('option')
        op.innerText = x
        op.value = x
        op.selected = x === poi.ease
        return op
      })
      selectEase.append(...options)

      const btnRemove = document.createElement('button')
      btnRemove.classList.add(DOMClass.remove)
      btnRemove.title = 'Remove'
      btnRemove.dataset.index = `${index}`
      btnRemove.innerText = 'x'

      const btnVisit = document.createElement('button')
      btnVisit.classList.add(DOMClass.visit)
      btnVisit.title = 'Visit'
      btnVisit.dataset.index = `${index}`
      btnVisit.innerHTML = '&rarr;'

      const btnMoveUp = document.createElement('button')
      btnMoveUp.classList.add(DOMClass.moveUp)
      btnMoveUp.title = 'Move up'
      btnMoveUp.dataset.index = `${index}`
      btnMoveUp.innerHTML = '&uarr;'

      const btnMoveDown = document.createElement('button')
      btnMoveDown.classList.add(DOMClass.moveDown)
      btnMoveDown.title = 'Move down'
      btnMoveDown.dataset.index = `${index}`
      btnMoveDown.innerHTML = '&darr;'

      controls.append(btnRemove, btnVisit, btnMoveUp, btnMoveDown)
      params.append(labelDuration, inputDuration, labelEase, selectEase)
      wrapper.append(image, controls)
      div.append(textHeading, wrapper, params)
      this.domList.appendChild(div)
    })
  }
}

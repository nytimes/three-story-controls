import { Quaternion, Vector3, AnimationClip, VectorKeyframeTrack, QuaternionKeyframeTrack } from 'three'
import { gsap } from 'gsap'
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

export class CameraHelper {
  readonly rig: CameraRig
  readonly controls: FreeMovementControls
  readonly canvas: HTMLCanvasElement
  private pois: POI[]
  private currentIndex: number | null
  private drawer: HTMLElement
  private domList: HTMLElement
  private collapseBtn: HTMLElement
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

  capture(): void {
    this.doCapture = true
  }

  update(time: number): void {
    if (this.doCapture) {
      const image = this.canvas.toDataURL()
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

  addPoi(image: string): void {
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

  updatePoi(index: number, props: Partial<POI>): void {
    this.pois[index] = {
      ...this.pois[index],
      ...props,
    }
  }

  movePoi(index: number, direction: number): void {
    if (index + direction >= 0 && index + direction < this.pois.length) {
      const temp = this.pois[index]
      this.pois[index] = this.pois[index + direction]
      this.pois[index + direction] = temp
      this.render()
    }
  }

  removePoi(index: number): void {
    this.pois.splice(index, 1)
    this.render()
  }

  goToPoi(index: number): void {
    const poi = this.pois[index]
    this.rig.flyTo(poi.position, poi.quaternion, poi.duration, poi.ease, this.useSlerp)
  }

  createClip(): void {
    const times = []
    const positionValues = []
    const quaternionValues = []
    const tmpPosition = new Vector3()
    const tmpQuaternion = new Quaternion()
    const framesPerPoi = 10

    let tweenStartTime = 0

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

  scrubClip(amount: number): void {
    this.rig.setAnimationPercentage(amount)
  }

  playClip(): void {
    this.isPlaying = true
  }

  export(): void {
    const jsondata = {} as any
    jsondata.pois = this.pois.map((poi) => {
      const position = [poi.position.x, poi.position.y, poi.position.z]
      const quaternion = [poi.quaternion.x, poi.quaternion.y, poi.quaternion.z, poi.quaternion.w]
      return {
        position,
        quaternion,
        duration: poi.duration,
        ease: poi.ease,
      }
    })
    if (this.animationClip) {
      jsondata.animationClip = AnimationClip.toJSON(this.animationClip)
    }
    const data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsondata))
    const a = document.createElement('a')
    a.href = 'data:' + data
    a.download = 'camera-control.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  exportImages(): void {
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

  initUI(canvasParent?: HTMLElement): void {
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

    const btnExport = document.createElement('button')
    btnExport.classList.add('btn-text', 'export')
    btnExport.innerText = 'export JSON'
    btnExport.onclick = this.export.bind(this)

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

    controlWrapper.append(btnPlay, sliderTime, bntExportImages, btnExport)
    this.drawer.append(btnAdd, this.collapseBtn, this.domList, controlWrapper)

    const parent = canvasParent || document.body
    parent.append(this.drawer)
  }

  handleEvents(event): void {
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

  collapse(): void {
    if (this.drawer.classList.contains('collapsed')) {
      this.drawer.classList.remove('collapsed')
      this.collapseBtn.innerText = '<'
    } else {
      this.drawer.classList.add('collapsed')
      this.collapseBtn.innerText = '>'
    }
  }

  render(): void {
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

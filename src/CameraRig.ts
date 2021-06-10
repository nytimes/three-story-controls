import {
  Vector3,
  Quaternion,
  Object3D,
  Camera,
  PerspectiveCamera,
  Scene,
  AnimationMixer,
  AnimationClip,
  EventDispatcher,
} from 'three'

import { TweenMax } from 'gsap'

/**
 * Event: Fired when CameraRig starts a transition
 * @example
 * ```javascript
 * rig.on('CameraMoveStart', () => {
 *   // do something
 * })
 * ```
 * */
export interface CameraMoveStartEvent {
  type: 'CameraMoveStart'
}

/**
 * Event: Fired on every tick of CameraRig's transition
 * @example
 * ```javascript
 * rig.on('CameraMoveUpdate', (e) => {
 *   console.log(e.progress)
 * })
 * ```
 * */
export interface CameraMoveUpdateEvent {
  type: 'CameraMoveUpdate'
  /** Percentage of transition completed, between 0 and 1. */
  progress: number
}

/**
 * Event: Fired when CameraRig ends a transition
 * @example
 * ```javascript
 * rig.on('CameraMoveEnd', (e) => {
 *   // do something
 * })
 * ```
 * */
export interface CameraMoveEndEvent {
  type: 'CameraMoveEnd'
}

export enum CameraAction {
  Pan = 'Pan',
  Tilt = 'Tilt',
  Roll = 'Roll',
  Truck = 'Truck',
  Pedestal = 'Pedestal',
  Dolly = 'Dolly',
  LocalTruck = 'LocalTruck',
  LocalPedestal = 'LocalPedestal',
  LocalDolly = 'LocalDolly',
  Zoom = 'Zoom',
  /* TODO "Orbit" = "Orbit" */
}

export enum Axis {
  X = 'X',
  Y = 'Y',
  Z = 'Z',
}

interface ActionAxes {
  [CameraAction.Pan]: Axis
  [CameraAction.Tilt]: Axis
  [CameraAction.Roll]: Axis
}

interface RotationBox {
  [Axis.X]: Object3D
  [Axis.Y]: Object3D
  [Axis.Z]: Object3D
}

export interface TranslateGuide {
  [CameraAction.Pan]: boolean
  [CameraAction.Tilt]: boolean
  [CameraAction.Roll]: boolean
}

const ActionMappingByUpAxis = {
  [Axis.X]: {
    [CameraAction.Pan]: Axis.X,
    [CameraAction.Tilt]: Axis.Z,
    [CameraAction.Roll]: Axis.Y,
  },
  [Axis.Y]: {
    [CameraAction.Pan]: Axis.Y,
    [CameraAction.Tilt]: Axis.X,
    [CameraAction.Roll]: Axis.Z,
  },
  [Axis.Z]: {
    [CameraAction.Pan]: Axis.Z,
    [CameraAction.Tilt]: Axis.X,
    [CameraAction.Roll]: Axis.Y,
  },
}

export interface CameraRigProps {
  upAxis?: Axis
  preventActionsWhileTransitioning?: boolean
}

/**
 * The CameraRig holds the camera, and can respond to actions such as Pan/Tilt/Dolly etc. It can also be controlled along a given path (in the form of an `AnimationClip`), or tweened to specified points.
 *
 * @remarks
 * The rig is made of 5 objects and a camera
 * A translation box with default name 'Translation',
 * A rotation box with default name 'Rotation',
 * with 3 nested objects (rotation components) -
 * each responsible for rotation around 1 axis
 *
 * The naming of 'Translation' and 'Rotation' is to ensure the rig naming
 * matches that of an animation clip, if provided -- making it trivial to
 * switch in and out of using an animation clip. These names can be
 * provided in the constructor props - to match the setup of the 3d tool used to
 * create the animation
 *
 * The camera actions Pan/Tilt/Roll control the inner rotation components,
 * not the rotation box. This allows for a seperation of a 'base' rotation
 * if needed (for example, the animation clip only controls the rotation box,
 * so the inner components are free to rotate anchored at this base. Similarly, moving
 * the rig to a specific position/orientation sets the rotation of the box,
 * leaving the components to control 3dof)
 *
 * The order of rotation is dependant on the current Up axis
 * Instead of having to remember the order, and keep track of axes visually,
 * Each axis is labelled by a camera action - Pan, Tilt, and Roll
 * When the Up axis is Y, for example, the Pan axis is Y, Tilt is X, and Roll is Z
 * Similarly, this is defined for the other possible Up axes
 * The order of rotation (and object nesting) is always Pan - Tilt - Roll
 *
 * Additionaly, it can be specified if the rig should be translated along
 * the current rotation direction any of the axes.
 * The default is to translate along the Pan axis (Y default), ie the rig will
 * move forward/backward in the direction the camera is panned to.
 *
 * The camera actions concerned with translation are Truck/Pedestal/Dolly
 * Again, instead of specifying x/y/z axes,
 * Truck is translation on the Tilt axis
 * Pedestal is translation on the Pan axis
 * and Dolly is translation on the Roll axis
 *
 * For 3dof controls, there are additional translate actions called
 * LocalTruck / LocalPedestal / LocalDolly
 * These will translate the inner rotation components, and perhaps
 * should not be used when creating 6dof controls.
 */
export class CameraRig extends EventDispatcher {
  readonly camera: Camera
  readonly scene: Scene
  private translationBox: Object3D
  private rotationBox: Object3D
  private rotationElements: RotationBox
  private cameraIsInRig: boolean
  private inTransit = false
  // private preventActionsWhileTransitioning = true
  private upAxis: Axis = Axis.Y
  private actionAxes: ActionAxes = ActionMappingByUpAxis[this.upAxis]
  private hasAnimation = false
  private animationClip: AnimationClip
  private mixer: AnimationMixer
  private animationTranslationObjectName = 'Translation'
  private animationRotationObjectName = 'Rotation'

  public respondsToActions = true

  // is this needed or should translation always occur along the Pan axis?
  public translateAlong: TranslateGuide = {
    [CameraAction.Tilt]: false,
    [CameraAction.Pan]: true,
    [CameraAction.Roll]: false,
  }

  // Constructor
  constructor(camera: Camera, scene: Scene, props: CameraRigProps = {}) {
    super()
    this.camera = camera
    this.scene = scene
    Object.assign(this, props)
    this.initRig()
  }

  private initRig(): void {
    this.translationBox = new Object3D()
    this.rotationBox = new Object3D()
    this.rotationElements = {
      [Axis.X]: new Object3D(),
      [Axis.Y]: new Object3D(),
      [Axis.Z]: new Object3D(),
    }
    this.rotationBox.name = this.animationRotationObjectName
    this.translationBox.name = this.animationTranslationObjectName
    this.translationBox.rotation.order = this.getRotationOrder()
    const first = this.rotationElements[this.actionAxes[CameraAction.Pan]]
    const second = this.rotationElements[this.actionAxes[CameraAction.Tilt]]
    const third = this.rotationElements[this.actionAxes[CameraAction.Roll]]
    this.scene.add(this.translationBox.add(this.rotationBox.add(first.add(second.add(third.add(this.camera))))))
    this.cameraIsInRig = true
  }

  // rotate component on axis by degrees
  private rotateRigComponent(rigComponent: Object3D, axis: Axis, degrees: number): void {
    switch (axis) {
      case Axis.X:
        rigComponent.rotateX(degrees)
        break
      case Axis.Y:
        rigComponent.rotateY(degrees)
        break
      case Axis.Z:
        rigComponent.rotateZ(degrees)
        break
      default:
        break
    }
  }

  // rotate degrees for given camera action
  private rotate(action: CameraAction, degrees: number): void {
    const axis = this.actionAxes[action]
    if (this.translateAlong[action]) {
      this.rotateRigComponent(this.translationBox, axis, degrees)
    } else {
      this.rotateRigComponent(this.rotationElements[axis], axis, degrees)
    }
  }

  // translate on axis by amount
  private translateRigComponent(rigComponent: Object3D, axis: Axis, amount: number): void {
    switch (axis) {
      case Axis.X:
        rigComponent.translateX(amount)
        break
      case Axis.Y:
        rigComponent.translateY(amount)
        break
      case Axis.Z:
        rigComponent.translateZ(amount)
        break
    }
  }

  /**
   * Set an animation clip for the rig
   * @param {AnimationClip} clip - AnimationClip containing a VectorKeyFrameTrack for position and a QuaternionKeyFrameTrack for rotation
   * @param {string} translationObjectName - Name of translation object
   * @param {string} rotationObjectName -  Name of rotation object
   */
  setAnimationClip(clip: AnimationClip, translationObjectName?: string, rotationObjectName?: string): void {
    this.animationClip = clip
    if (translationObjectName) this.animationTranslationObjectName = translationObjectName
    if (rotationObjectName) this.animationRotationObjectName = rotationObjectName
    this.hasAnimation = true
    this.mixer = new AnimationMixer(this.translationBox)
    const action = this.mixer.clipAction(this.animationClip)
    action.play()
    this.mixer.setTime(0)
  }

  /**
   * Main method for controlling the camera
   * @param action - Action to perform
   * @param amount - Amount to move/rotate/etc
   */
  do(action: CameraAction, amount: number): void {
    if (this.respondsToActions) {
      switch (action) {
        case CameraAction.Pan:
        case CameraAction.Tilt:
        case CameraAction.Roll:
          this.rotate(action, amount)
          break
        case CameraAction.Truck:
          this.translateRigComponent(this.translationBox, this.actionAxes[CameraAction.Tilt], amount)
          break
        case CameraAction.Pedestal:
          this.translateRigComponent(this.translationBox, this.actionAxes[CameraAction.Pan], amount)
          break
        case CameraAction.Dolly:
          this.translateRigComponent(this.translationBox, this.actionAxes[CameraAction.Roll], amount)
          break
        case CameraAction.LocalTruck:
          {
            const axis = this.actionAxes[CameraAction.Tilt]
            this.translateRigComponent(this.rotationElements[axis], axis, amount)
          }
          break
        case CameraAction.LocalPedestal:
          {
            const axis = this.actionAxes[CameraAction.Pan]
            this.translateRigComponent(this.rotationElements[axis], axis, amount)
          }
          break
        case CameraAction.LocalDolly:
          {
            const axis = this.actionAxes[CameraAction.Roll]
            this.translateRigComponent(this.rotationElements[axis], axis, amount)
          }
          break
        case CameraAction.Zoom:
          if (this.camera instanceof PerspectiveCamera) {
            this.camera.fov = amount
            this.camera.updateProjectionMatrix()
          }
          break
        default:
          break
      }
    }
  }

  // TODO: add 'unpackTransform', change freeze to 'pack'

  /**
   * Packs transfrom into parent translation and rotation elements,
   * and 0s out transforms for all inner elements. Useful to use before
   * procedural animation on world position and quaternion
   */
  freezeTransform(): void {
    const { position, quaternion } = this.getWorldCoordinates()
    this.translationBox.position.copy(position)
    this.translationBox.rotation.set(0, 0, 0)
    this.rotationBox.quaternion.copy(quaternion)
    this.rotationBox.position.set(0, 0, 0)
    for (const key in this.rotationElements) {
      this.rotationElements[key].position.set(0, 0, 0)
      this.rotationElements[key].rotation.set(0, 0, 0)
    }
  }

  /**
   * Disassemble the camera from the rig and attach it to the scene.
   * Useful if one needs to set the camera's world position or
   * control it outside of the rig setup
   */
  disassemble(): void {
    if (this.cameraIsInRig) {
      this.scene.attach(this.camera)
      this.cameraIsInRig = false
    }
  }

  /**
   * Place the camera back in the rig
   */
  // TODO: rethink freeze/unfreeze and assemble/disassemble transforms
  assemble(): void {
    if (!this.cameraIsInRig) {
      const { position, quaternion } = this.getWorldCoordinates()
      this.translationBox.position.copy(position)
      this.rotationBox.quaternion.copy(quaternion)
      this.rotationElements[this.actionAxes[CameraAction.Roll]].attach(this.camera)
      this.cameraIsInRig = true
    }
  }

  /**
   * @returns Whether the camera is attached to the rig
   */
  isInRig(): boolean {
    return this.cameraIsInRig
  }

  /**
   * Get the rotaion order as a string compatible with what three.js uses
   */
  getRotationOrder(): string {
    return Object.values(this.actionAxes).join('')
  }

  /**
   * Get world position and orientation of the camera
   */
  getWorldCoordinates(): { position: Vector3; quaternion: Quaternion } {
    const position = new Vector3()
    this.camera.getWorldPosition(position)
    const quaternion = new Quaternion()
    this.camera.getWorldQuaternion(quaternion)
    return { position, quaternion }
  }

  /**
   * If the camera is in the middle of a transition
   */
  isMoving(): boolean {
    return this.inTransit
  }

  /**
   * Set the Up axis for the camera, adjusting the rotation components accordingly
   * to maintain consistent Pan/Tilt/Roll behaviour
   * ... might not be necessary, rotationBox transforms could take care of setting context
   * @param axis - New Up axis
   */
  setUpAxis(axis: Axis): void {
    const currentAxes = this.actionAxes
    this.upAxis = axis
    this.actionAxes = ActionMappingByUpAxis[this.upAxis]

    const currentPanObject = this.rotationElements[currentAxes[CameraAction.Pan]]
    const currentTiltObject = this.rotationElements[currentAxes[CameraAction.Tilt]]
    const currentRollObject = this.rotationElements[currentAxes[CameraAction.Roll]]
    // reassign objects to retain nesting
    this.rotationElements[this.actionAxes[CameraAction.Pan]] = currentPanObject
    this.rotationElements[this.actionAxes[CameraAction.Tilt]] = currentTiltObject
    this.rotationElements[this.actionAxes[CameraAction.Roll]] = currentRollObject

    this.translationBox.rotation.order = this.getRotationOrder()
  }

  /**
   * Transition to a specific position and orientation in world space.
   * All inner rotation components will be reset to 0 as a result of this.
   * @param position
   * @param quaternion
   * @param duration
   * @param ease
   */
  flyTo(position: Vector3, quaternion: Quaternion, duration = 1, ease = 'power1'): void {
    if (!this.isMoving()) {
      const currentCoords = this.getWorldCoordinates()
      const currentValues = {
        px: currentCoords.position.x,
        py: currentCoords.position.y,
        pz: currentCoords.position.z,
        qx: currentCoords.quaternion.x,
        qy: currentCoords.quaternion.y,
        qz: currentCoords.quaternion.z,
        qw: currentCoords.quaternion.w,
      }
      const targetValues = {
        px: position.x,
        py: position.y,
        pz: position.z,
        qx: quaternion.x,
        qy: quaternion.y,
        qz: quaternion.z,
        qw: quaternion.w,
      }
      const onStart = (): void => {
        this.inTransit = true
        this.disassemble()
        this.dispatchEvent({ type: 'CameraMoveStart' } as CameraMoveStartEvent)
      }
      const onUpdate = (tween: TweenMax): void => {
        this.camera.position.set(currentValues.px, currentValues.py, currentValues.pz)
        this.camera.quaternion.set(currentValues.qx, currentValues.qy, currentValues.qz, currentValues.qw)
        this.dispatchEvent({
          type: 'CameraMoveUpdate',
          progress: tween.progress(),
        } as CameraMoveUpdateEvent)
      }
      const onComplete = (): void => {
        this.assemble()
        this.inTransit = false
        this.dispatchEvent({ type: 'CameraMoveEnd' } as CameraMoveEndEvent)
      }
      TweenMax.to(currentValues, {
        duration,
        ease,
        ...targetValues,
        onStart,
        onUpdate: function () {
          onUpdate(this)
        },
        onComplete,
      })
    }
  }

  /**
   * Transition to a specific keyframe on the animation clip
   * All inner rotation components will be reset to 0 as a result of this.
   * @param frame - frame
   * @param duration - duration
   * @param ease - ease
   */
  flyToKeyframe(frame: number, duration = 1, ease = 'power1'): void {
    if (this.hasAnimation && !this.isMoving()) {
      const currentValues = {
        time: this.mixer.time,
      }
      const targetValues = {
        time: this.animationClip.tracks[0].times[frame],
      }
      const onStart = (): void => {
        this.inTransit = true
        this.dispatchEvent({ type: 'CameraMoveStart' } as CameraMoveStartEvent)
      }
      const onUpdate = (tween: TweenMax): void => {
        this.mixer.setTime(currentValues.time)
        this.dispatchEvent({
          type: 'CameraMoveUpdate',
          progress: tween.progress(),
        } as CameraMoveUpdateEvent)
      }
      const onComplete = (): void => {
        this.inTransit = false
        this.dispatchEvent({ type: 'CameraMoveEnd' } as CameraMoveEndEvent)
      }
      TweenMax.to(currentValues, {
        duration,
        ease,
        ...targetValues,
        onStart,
        onUpdate: function () {
          onUpdate(this)
        },
        onComplete,
      })
    }
  }

  /**
   * @param percentage - percentage of animation clip to move to, between 0 and 1
   */
  setAnimationPercentage(percentage: number): void {
    if (this.hasAnimation) {
      const percent = Math.max(
        0,
        Math.min(percentage * this.animationClip.duration, this.animationClip.duration - 0.0001),
      )
      this.mixer.setTime(percent)
    }
  }

  /**
   * @param time - timestamp of animation clip to move to
   */
  setAnimationTime(time: number): void {
    if (this.hasAnimation) this.mixer.setTime(time)
  }

  /**
   * @param frame - frame of animation clip to move to
   */
  setAnimationKeyframe(frame: number): void {
    if (this.hasAnimation) this.mixer.setTime(this.animationClip.tracks[0].times[frame])
  }
}

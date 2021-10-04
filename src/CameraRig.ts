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
  Euler,
} from 'three'

import gsap from 'gsap'

/**
 * Event: Fired when CameraRig starts a transition
 * @example
 * ```javascript
 * rig.addEventListener('CameraMoveStart', handlerFunction)
 * ```
 * */
export interface CameraMoveStartEvent {
  type: 'CameraMoveStart'
}

/**
 * Event: Fired on every tick of CameraRig's transition
 * @example
 * ```javascript
 * rig.addEventListener('CameraMoveUpdate', handlerFunction)
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
 * rig.addEventListener('CameraMoveEnd', handlerFunction)
 * ```
 * */
export interface CameraMoveEndEvent {
  type: 'CameraMoveEnd'
}

/**
 * Enum of camera actions used to control a {@link three-story-controls#CameraRig}
 */
export enum CameraAction {
  Pan = 'Pan',
  Tilt = 'Tilt',
  Roll = 'Roll',
  Truck = 'Truck',
  Pedestal = 'Pedestal',
  Dolly = 'Dolly',
  Zoom = 'Zoom',
}

/**
 * Enum of {@link three-story-controls#CameraRig} parts
 */
export enum RigComponent {
  Body = 'body',
  Head = 'head',
  Eyes = 'eyes',
}

/**
 * Enum of axes
 */
export enum Axis {
  X = 'x',
  Y = 'y',
  Z = 'z',
}

/**
 * Describe whether rig should translate along current rotation in each action axis
 */
export interface TranslateGuide {
  [CameraAction.Pan]: boolean
  [CameraAction.Tilt]: boolean
  [CameraAction.Roll]: boolean
}

/**
 * Mapping of rotation action to axis
 */
export interface ActionAxes {
  [CameraAction.Pan]: Axis
  [CameraAction.Tilt]: Axis
  [CameraAction.Roll]: Axis
}

const AxisVector = {
  [Axis.X]: new Vector3(1, 0, 0),
  [Axis.Y]: new Vector3(0, 1, 0),
  [Axis.Z]: new Vector3(0, 0, 1),
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
    [CameraAction.Tilt]: Axis.Y,
    [CameraAction.Roll]: Axis.X,
  },
}

/**
 * The CameraRig holds the camera, and can respond to {@link three-story-controls#CameraAction}s such as Pan/Tilt/Dolly etc. It can also be controlled along a given path (in the form of an `AnimationClip`), or tweened to specified points.
 *
 * @remarks
 * The rig is constructed of three objects, analagous to a body, head and eyes. The camera is nested in the eyes and is never transformed directly.
 *
 * Instead of specifying the axis to rotate/translate the camera, {@link three-story-controls#CameraAction}s are used. The rotation order of actions is always `Pan` then `Tilt` then `Roll`.
 * The mapping of these actions to axes depends on the up axis, which defaults to `Y` (but can be changed with the {@link CameraRig.setUpAxis | setUpAxis() method}):
 *
 * * `CameraAction.Pan` rotates around the `Y` axis
 *
 * * `CameraAction.Tilt` rotates around the `X` axis
 *
 * * `CameraAction.Roll` rotates around the `Z` axis
 *
 * * `CameraAction.Dolly` translates on the `Z` axis
 *
 * * `CameraAction.Truck` translates on the `X` axis
 *
 * * `CameraAction.Pedestal` translates on the `Y` axis
 *
 * Translations will be applied to the 'body' of the rig, and rotations to the 'eyes'. If an animation clip is provided, or the camera is tweened to a specific location,
 * the rotations will be applied to the 'head', thus leaving the 'eyes' free to 'look around' from this base position.
 *
 * Additionally, the default setup assumes that the rig will move forward/backward (`Dolly`) in the direction the camera is panned to.
 * This can be configured through {@link CameraRig.translateAlong | translateAlong property}.
 * It can also be overwritten by providing the component name to the {@link CameraRig.do | do() method}, see {@link https://github.com/nytimes/three-story-controls/blob/main/src/controlschemes/ThreeDOFControls.ts#L96 | ThreeDOFControls implementation} for an example.
 *
 * To move the rig along a specified path, use the {@link CameraRig.setAnimationClip | setAnimationClip() method},
 *  and set the names for the `Translation` and `Rotation` objects to match those of the clip. The clip should have a `VectorKeyframeTrack` for the outer position/translation object,
 *  and a `QuaternionKeyframeTrack` for the inner orientation/rotation object.
 *
 * See {@link three-story-controls#CameraMoveStartEvent}, {@link three-story-controls#CameraMoveUpdateEvent} and {@link three-story-controls#CameraMoveEndEvent} for emitted event signatures.
 */
export class CameraRig extends EventDispatcher {
  readonly camera: Camera
  readonly scene: Scene
  private body: Object3D
  private head: Object3D
  private eyes: Object3D
  private cameraIsInRig: boolean
  private inTransit = false
  private upAxis: Axis = Axis.Y
  private actionAxes: ActionAxes = ActionMappingByUpAxis[this.upAxis]
  private hasAnimation = false
  private animationClip: AnimationClip
  private mixer: AnimationMixer
  private animationTranslationObjectName = 'Translation'
  private animationRotationObjectName = 'Rotation'

  public translateAlong: TranslateGuide = {
    [CameraAction.Tilt]: false,
    [CameraAction.Pan]: true,
    [CameraAction.Roll]: false,
  }

  // Constructor
  constructor(camera: Camera, scene: Scene) {
    super()
    this.camera = camera
    this.scene = scene
    this.body = new Object3D()
    this.head = new Object3D()
    this.eyes = new Object3D()
    this.head.name = this.animationRotationObjectName
    this.body.name = this.animationTranslationObjectName
    this.body.rotation.order = this.getRotationOrder()
    this.head.rotation.order = this.getRotationOrder()
    this.eyes.rotation.order = this.getRotationOrder()
    this.scene.add(this.body.add(this.head.add(this.eyes.add(this.camera))))
    this.cameraIsInRig = true
    this.unpackTransform()
  }

  /**
   * Get the axis for a given action
   * @param action
   * @returns x | y | z
   */
  getAxisFor(action: CameraAction): string {
    return this.actionAxes[action]
  }

  /**
   * Get the axis' vector for a given action
   * @param action
   * @returns Normalized vector for the axis
   */
  getAxisVectorFor(action: CameraAction): Vector3 {
    return AxisVector[this.actionAxes[action]]
  }

  /**
   * Main method for controlling the camera
   * @param action - Action to perform
   * @param amount - Amount to move/rotate/etc
   * @param rigComponent - Override the default component to perform the action on
   */
  do(action: CameraAction, amount: number, rigComponent?: RigComponent): void {
    const targetComponent = this[rigComponent]

    switch (action) {
      case CameraAction.Pan:
      case CameraAction.Tilt:
      case CameraAction.Roll: {
        const axis = this.getAxisVectorFor(action)
        if (targetComponent) {
          targetComponent.rotateOnAxis(axis, amount)
        } else if (this.translateAlong[action]) {
          this.body.rotateOnAxis(axis, amount)
        } else {
          this.eyes.rotateOnAxis(axis, amount)
        }
        break
      }

      case CameraAction.Truck: {
        const axis = this.getAxisVectorFor(CameraAction.Tilt)
        const component = targetComponent || this.body
        component.translateOnAxis(axis, amount)
        break
      }

      case CameraAction.Pedestal: {
        const axis = this.getAxisVectorFor(CameraAction.Pan)
        const component = targetComponent || this.body
        component.translateOnAxis(axis, amount)
        break
      }

      case CameraAction.Dolly: {
        const axis = this.getAxisVectorFor(CameraAction.Roll)
        const component = targetComponent || this.body
        component.translateOnAxis(axis, amount)
        break
      }

      case CameraAction.Zoom: {
        if (this.camera instanceof PerspectiveCamera) {
          this.camera.fov = amount
          this.camera.updateProjectionMatrix()
        }
        break
      }

      default:
        break
    }
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
   * Sets world coordinates for the camera, and configures rig component transforms accordingly.
   * @param param0
   */
  setWorldCoordinates({ position, quaternion }: { position: Vector3; quaternion: Quaternion }): void {
    const currentRotation = new Euler().setFromQuaternion(quaternion, this.getRotationOrder())
    const actions = [CameraAction.Pan, CameraAction.Tilt, CameraAction.Roll]
    this.eyes.position.set(0, 0, 0)
    this.eyes.rotation.set(0, 0, 0)
    this.head.position.set(0, 0, 0)
    this.head.rotation.set(0, 0, 0)
    this.body.position.copy(position)
    actions.forEach((action) => {
      const axis = this.getAxisFor(action)
      if (this.translateAlong[action]) {
        this.body.rotation[axis] = currentRotation[axis]
      } else {
        this.eyes.rotation[axis] = currentRotation[axis]
      }
    })
    this.camera.rotation.set(0, 0, 0)
    this.camera.position.set(0, 0, 0)
  }

  /**
   * Packs transfrom into the body and head, and 0s out transforms of the eyes. Useful for preparing the
   * rig for control through an animation clip.
   */
  packTransform(): void {
    const { position, quaternion } = this.getWorldCoordinates()
    this.body.position.copy(position)
    this.body.rotation.set(0, 0, 0)
    this.head.quaternion.copy(quaternion)
    this.head.position.set(0, 0, 0)
    this.eyes.position.set(0, 0, 0)
    this.eyes.rotation.set(0, 0, 0)
  }

  /**
   * Unpacks the current camera world coordinates and distributes transforms
   * across the rig componenets.
   */
  unpackTransform(): void {
    const { position, quaternion } = this.getWorldCoordinates()
    this.setWorldCoordinates({ position, quaternion })
  }

  /**
   * Disassemble the camera from the rig and attach it to the scene.
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
  assemble(): void {
    if (!this.cameraIsInRig) {
      this.eyes.attach(this.camera)
      this.unpackTransform()
      this.cameraIsInRig = true
    }
  }

  /**
   * Get the rotation order as a string compatible with what three.js uses
   */
  getRotationOrder(): string {
    return Object.values(this.actionAxes).join('').toUpperCase()
  }

  /**
   * Whether the camera is currently attached to the rig
   */
  isInRig(): boolean {
    return this.cameraIsInRig
  }

  /**
   * If the camera is in the middle of a transition
   */
  isMoving(): boolean {
    return this.inTransit
  }

  /**
   * Set the up axis for the camera
   * @param axis - New Up axis
   */
  setUpAxis(axis: Axis): void {
    this.upAxis = axis
    this.actionAxes = ActionMappingByUpAxis[this.upAxis]
    this.body.rotation.order = this.getRotationOrder()
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
    // hack. threejs skips last frame when seek time = clip duration
    this.animationClip.duration += 0.01
    this.mixer = new AnimationMixer(this.body)
    const action = this.mixer.clipAction(this.animationClip)
    action.clampWhenFinished = true
    action.play()
  }

  /**
   * Transition to a specific position and orientation in world space.
   * Transform on eyes will be reset to 0 as a result of this.
   * @param position
   * @param quaternion
   * @param duration
   * @param ease
   * @param useSlerp
   */
  flyTo(position: Vector3, quaternion: Quaternion, duration = 1, ease = 'power1', useSlerp = true): void {
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
        slerpAmt: 0,
      }
      const targetValues = {
        px: position.x,
        py: position.y,
        pz: position.z,
        qx: quaternion.x,
        qy: quaternion.y,
        qz: quaternion.z,
        qw: quaternion.w,
        slerpAmt: 1,
      }
      const tempQuaternion = new Quaternion()
      const startQuaternion = new Quaternion(currentValues.qx, currentValues.qy, currentValues.qz, currentValues.qw)
      const onStart = (): void => {
        this.inTransit = true
        this.packTransform()
        this.dispatchEvent({ type: 'CameraMoveStart' } as CameraMoveStartEvent)
      }
      const onUpdate = (tween): void => {
        this.body.position.set(currentValues.px, currentValues.py, currentValues.pz)
        if (useSlerp) {
          tempQuaternion.slerpQuaternions(startQuaternion, quaternion, currentValues.slerpAmt)
          this.head.setRotationFromQuaternion(tempQuaternion)
        } else {
          this.head.quaternion.set(currentValues.qx, currentValues.qy, currentValues.qz, currentValues.qw)
        }
        this.dispatchEvent({
          type: 'CameraMoveUpdate',
          progress: tween.progress(),
        } as CameraMoveUpdateEvent)
      }
      const onComplete = (): void => {
        this.inTransit = false
        this.unpackTransform()
        this.dispatchEvent({ type: 'CameraMoveEnd' } as CameraMoveEndEvent)
      }
      gsap.to(currentValues, {
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
   * Transform on eyes will be reset to 0 as a result of this.
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
      const onUpdate = (tween): void => {
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
      gsap.to(currentValues, {
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

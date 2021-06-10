import { Vector3, Quaternion, Camera, Scene, AnimationClip, EventDispatcher } from 'three';
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
    type: 'CameraMoveStart';
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
    type: 'CameraMoveUpdate';
    /** Percentage of transition completed, between 0 and 1. */
    progress: number;
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
    type: 'CameraMoveEnd';
}
export declare enum CameraAction {
    Pan = "Pan",
    Tilt = "Tilt",
    Roll = "Roll",
    Truck = "Truck",
    Pedestal = "Pedestal",
    Dolly = "Dolly",
    LocalTruck = "LocalTruck",
    LocalPedestal = "LocalPedestal",
    LocalDolly = "LocalDolly",
    Zoom = "Zoom"
}
export declare enum Axis {
    X = "X",
    Y = "Y",
    Z = "Z"
}
export interface TranslateGuide {
    [CameraAction.Pan]: boolean;
    [CameraAction.Tilt]: boolean;
    [CameraAction.Roll]: boolean;
}
export interface CameraRigProps {
    upAxis?: Axis;
    preventActionsWhileTransitioning?: boolean;
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
export declare class CameraRig extends EventDispatcher {
    readonly camera: Camera;
    readonly scene: Scene;
    private translationBox;
    private rotationBox;
    private rotationElements;
    private cameraIsInRig;
    private inTransit;
    private upAxis;
    private actionAxes;
    private hasAnimation;
    private animationClip;
    private mixer;
    private animationTranslationObjectName;
    private animationRotationObjectName;
    respondsToActions: boolean;
    translateAlong: TranslateGuide;
    constructor(camera: Camera, scene: Scene, props?: CameraRigProps);
    private initRig;
    private rotateRigComponent;
    private rotate;
    private translateRigComponent;
    /**
     * Set an animation clip for the rig
     * @param {AnimationClip} clip - AnimationClip containing a VectorKeyFrameTrack for position and a QuaternionKeyFrameTrack for rotation
     * @param {string} translationObjectName - Name of translation object
     * @param {string} rotationObjectName -  Name of rotation object
     */
    setAnimationClip(clip: AnimationClip, translationObjectName?: string, rotationObjectName?: string): void;
    /**
     * Main method for controlling the camera
     * @param action - Action to perform
     * @param amount - Amount to move/rotate/etc
     */
    do(action: CameraAction, amount: number): void;
    /**
     * Packs transfrom into parent translation and rotation elements,
     * and 0s out transforms for all inner elements. Useful to use before
     * procedural animation on world position and quaternion
     */
    freezeTransform(): void;
    /**
     * Disassemble the camera from the rig and attach it to the scene.
     * Useful if one needs to set the camera's world position or
     * control it outside of the rig setup
     */
    disassemble(): void;
    /**
     * Place the camera back in the rig
     */
    assemble(): void;
    /**
     * @returns Whether the camera is attached to the rig
     */
    isInRig(): boolean;
    /**
     * Get the rotaion order as a string compatible with what three.js uses
     */
    getRotationOrder(): string;
    /**
     * Get world position and orientation of the camera
     */
    getWorldCoordinates(): {
        position: Vector3;
        quaternion: Quaternion;
    };
    /**
     * If the camera is in the middle of a transition
     */
    isMoving(): boolean;
    /**
     * Set the Up axis for the camera, adjusting the rotation components accordingly
     * to maintain consistent Pan/Tilt/Roll behaviour
     * ... might not be necessary, rotationBox transforms could take care of setting context
     * @param axis - New Up axis
     */
    setUpAxis(axis: Axis): void;
    /**
     * Transition to a specific position and orientation in world space.
     * All inner rotation components will be reset to 0 as a result of this.
     * @param position
     * @param quaternion
     * @param duration
     * @param ease
     */
    flyTo(position: Vector3, quaternion: Quaternion, duration?: number, ease?: string): void;
    /**
     * Transition to a specific keyframe on the animation clip
     * All inner rotation components will be reset to 0 as a result of this.
     * @param frame - frame
     * @param duration - duration
     * @param ease - ease
     */
    flyToKeyframe(frame: number, duration?: number, ease?: string): void;
    /**
     * @param percentage - percentage of animation clip to move to, between 0 and 1
     */
    setAnimationPercentage(percentage: number): void;
    /**
     * @param time - timestamp of animation clip to move to
     */
    setAnimationTime(time: number): void;
    /**
     * @param frame - frame of animation clip to move to
     */
    setAnimationKeyframe(frame: number): void;
}
//# sourceMappingURL=CameraRig.d.ts.map
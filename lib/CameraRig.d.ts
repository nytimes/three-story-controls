import { Vector3, Quaternion, Camera, Scene, AnimationClip, EventDispatcher } from 'three';
/**
 * Event: Fired when CameraRig starts a transition
 * @example
 * ```javascript
 * rig.addEventListener('CameraMoveStart', handlerFunction)
 * ```
 * */
export interface CameraMoveStartEvent {
    type: 'CameraMoveStart';
}
/**
 * Event: Fired on every tick of CameraRig's transition
 * @example
 * ```javascript
 * rig.addEventListener('CameraMoveUpdate', handlerFunction)
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
 * rig.addEventListener('CameraMoveEnd', handlerFunction)
 * ```
 * */
export interface CameraMoveEndEvent {
    type: 'CameraMoveEnd';
}
/**
 * Enum of camera actions used to control a {@link @threebird/controls#CameraRig}
 */
export declare enum CameraAction {
    Pan = "Pan",
    Tilt = "Tilt",
    Roll = "Roll",
    Truck = "Truck",
    Pedestal = "Pedestal",
    Dolly = "Dolly",
    Zoom = "Zoom"
}
/**
 * Enum of {@link @threebird/controls#CameraRig} parts
 */
export declare enum RigComponent {
    Body = "body",
    Head = "head",
    Eyes = "eyes"
}
/**
 * Enum of axes
 */
export declare enum Axis {
    X = "x",
    Y = "y",
    Z = "z"
}
/**
 * Describe whether rig should translate along current rotation in each action axis
 */
export interface TranslateGuide {
    [CameraAction.Pan]: boolean;
    [CameraAction.Tilt]: boolean;
    [CameraAction.Roll]: boolean;
}
/**
 * Mapping of rotation action to axis
 */
export interface ActionAxes {
    [CameraAction.Pan]: Axis;
    [CameraAction.Tilt]: Axis;
    [CameraAction.Roll]: Axis;
}
/**
 * The CameraRig holds the camera, and can respond to {@link @threebird/controls#CameraAction}s such as Pan/Tilt/Dolly etc. It can also be controlled along a given path (in the form of an `AnimationClip`), or tweened to specified points.
 *
 * @remarks
 * The rig is constructed of three objects, analagous to a body, head and eyes. The camera is nested in the eyes and is never transformed directly.
 *
 * Instead of specifying the axis to rotate/translate the camera, {@link @threebird/controls#CameraAction}s are used. The rotation order of actions is always `Pan` then `Tilt` then `Roll`.
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
 * It can also be overwritten by providing the component name to the {@link CameraRig.do | do() method}, see [src/controlschemes/ThreeDOFControls.ts](src/controlschemes/ThreeDOFControls.ts) for an example.
 *
 * To move the rig along a specified path, use the {@link CameraRig.setAnimationClip | setAnimationClip() method},
 *  and set the names for the `Translation` and `Rotation` objects to match those of the clip. The clip should have a `VectorKeyframeTrack` for the outer position/translation object,
 *  and a `QuaternionKeyframeTrack` for the inner orientation/rotation object.
 */
export declare class CameraRig extends EventDispatcher {
    readonly camera: Camera;
    readonly scene: Scene;
    private body;
    private head;
    private eyes;
    private cameraIsInRig;
    private inTransit;
    private upAxis;
    private actionAxes;
    private hasAnimation;
    private animationClip;
    private mixer;
    private animationTranslationObjectName;
    private animationRotationObjectName;
    translateAlong: TranslateGuide;
    constructor(camera: Camera, scene: Scene);
    /**
     * Get the axis for a given action
     * @param action
     * @returns x | y | z
     */
    getAxisFor(action: CameraAction): string;
    /**
     * Get the axis' vector for a given action
     * @param action
     * @returns Normalized vector for the axis
     */
    getAxisVectorFor(action: CameraAction): Vector3;
    /**
     * Main method for controlling the camera
     * @param action - Action to perform
     * @param amount - Amount to move/rotate/etc
     * @param rigComponent - Override the default component to perform the action on
     */
    do(action: CameraAction, amount: number, rigComponent?: RigComponent): void;
    /**
     * Get world position and orientation of the camera
     */
    getWorldCoordinates(): {
        position: Vector3;
        quaternion: Quaternion;
    };
    /**
     * Sets world coordinates for the camera, and configures rig component transforms accordingly.
     * @param param0
     */
    setWorldCoordinates({ position, quaternion }: {
        position: Vector3;
        quaternion: Quaternion;
    }): void;
    /**
     * Packs transfrom into the body and head, and 0s out transforms of the eyes. Useful for preparing the
     * rig for control through an animation clip.
     */
    packTransform(): void;
    /**
     * Unpacks the current camera world coordinates and distributes transforms
     * across the rig componenets.
     */
    unpackTransform(): void;
    /**
     * Disassemble the camera from the rig and attach it to the scene.
     */
    disassemble(): void;
    /**
     * Place the camera back in the rig
     */
    assemble(): void;
    /**
     * Get the rotation order as a string compatible with what three.js uses
     */
    getRotationOrder(): string;
    /**
     * Whether the camera is currently attached to the rig
     */
    isInRig(): boolean;
    /**
     * If the camera is in the middle of a transition
     */
    isMoving(): boolean;
    /**
     * Set the up axis for the camera
     * @param axis - New Up axis
     */
    setUpAxis(axis: Axis): void;
    /**
     * Set an animation clip for the rig
     * @param {AnimationClip} clip - AnimationClip containing a VectorKeyFrameTrack for position and a QuaternionKeyFrameTrack for rotation
     * @param {string} translationObjectName - Name of translation object
     * @param {string} rotationObjectName -  Name of rotation object
     */
    setAnimationClip(clip: AnimationClip, translationObjectName?: string, rotationObjectName?: string): void;
    /**
     * Transition to a specific position and orientation in world space.
     * Transform on eyes will be reset to 0 as a result of this.
     * @param position
     * @param quaternion
     * @param duration
     * @param ease
     * @param useSlerp
     */
    flyTo(position: Vector3, quaternion: Quaternion, duration?: number, ease?: string, useSlerp?: boolean): void;
    /**
     * Transition to a specific keyframe on the animation clip
     * Transform on eyes will be reset to 0 as a result of this.
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
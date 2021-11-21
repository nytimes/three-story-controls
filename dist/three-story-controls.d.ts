import { AnimationClip } from 'three';
import { Camera } from 'three';
import { EventDispatcher } from 'three';
import { Quaternion } from 'three';
import { Scene } from 'three';
import { Vector3 } from 'three';

/**
 * Mapping of rotation action to axis
 */
export declare interface ActionAxes {
    [CameraAction.Pan]: Axis;
    [CameraAction.Tilt]: Axis;
    [CameraAction.Roll]: Axis;
}

/**
 * Enum of axes
 */
export declare enum Axis {
    X = "x",
    Y = "y",
    Z = "z"
}

export declare abstract class BaseAdaptor extends EventDispatcher {
    constructor();
    abstract connect(): void;
    abstract disconnect(): void;
    abstract update(time?: number): void;
    abstract isEnabled(): boolean;
}

export declare interface BaseControls {
    enable(): void;
    disable(): void;
    update(time?: number): void;
}

/**
 * Enum of camera actions used to control a {@link three-story-controls#CameraRig}
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
export declare class CameraHelper {
    readonly rig: CameraRig;
    readonly controls: FreeMovementControls;
    readonly canvas: HTMLCanvasElement;
    private pois;
    private currentIndex;
    private drawer;
    private domList;
    private collapseBtn;
    private fileInput;
    private btnImport;
    private doCapture;
    private animationClip;
    private isPlaying;
    private playStartTime;
    private useSlerp;
    constructor(rig: CameraRig, controls: FreeMovementControls, canvas: HTMLCanvasElement, canvasParent?: HTMLElement);
    private capture;
    update(time: number): void;
    private addPoi;
    private updatePoi;
    private movePoi;
    private removePoi;
    private goToPoi;
    private createClip;
    private scrubClip;
    private playClip;
    private import;
    private export;
    private exportImages;
    private initUI;
    private handleEvents;
    private collapse;
    private render;
}

/**
 * Event: Fired when CameraRig ends a transition
 * @example
 * ```javascript
 * rig.addEventListener('CameraMoveEnd', handlerFunction)
 * ```
 * */
export declare interface CameraMoveEndEvent {
    type: 'CameraMoveEnd';
}

/**
 * Event: Fired when CameraRig starts a transition
 * @example
 * ```javascript
 * rig.addEventListener('CameraMoveStart', handlerFunction)
 * ```
 * */
export declare interface CameraMoveStartEvent {
    type: 'CameraMoveStart';
}

/**
 * Event: Fired on every tick of CameraRig's transition
 * @example
 * ```javascript
 * rig.addEventListener('CameraMoveUpdate', handlerFunction)
 * ```
 * */
export declare interface CameraMoveUpdateEvent {
    type: 'CameraMoveUpdate';
    /** Percentage of transition completed, between 0 and 1. */
    progress: number;
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

export declare interface ContinuousEvent {
    type: 'update';
}

declare interface Coordinates extends DamperValues {
    x: number;
    y: number;
}

/**
 * Damper uses simple linear damping for a given collection of values.
 * On every call to update, the damper will approach a given set of target values.
 * @example
 * ```js
 * const damper = new Damper({
 *  values: {x: 0, y: 0},
 *  dampingFactor: 0.4
 * })
 *
 * damper.setTarget({ x: 1, y: 100 })
 * damper.update() // would generally be called in an animation loop
 * const values = damper.getCurrentValues() // values.x = 0.4; values.y = 40
 * ```
 */
export declare class Damper {
    private dampingFactor;
    private epsilon;
    private values;
    private targetValues;
    private deltaValues;
    private hasReached;
    constructor(props: DamperProps);
    /**
     * Update the damper, should generally be called on every frame
     */
    update(): void;
    /**
     * Set the target values the damper needs to approach
     * @param target DamperValues the damper needs to approach
     */
    setTarget(target: DamperValues): void;
    /**
     * Increment/Decrement a specifc damper target value
     * @param key The key of the value to modify
     * @param value The amount to modify the target by
     */
    addToTarget(key: string, value: number): void;
    /**
     * Reset all damper values to the fiven number
     * @param value Number to reset all damper values to
     */
    resetAll(value: number): void;
    /**
     * Reset damper values as described by the given DamperValues object
     * @param values DamperValues object to reset the damper to
     */
    resetData(values: DamperValues): void;
    /**
     * Get the current values
     * @returns DamperValues object with the current values of the damper
     */
    getCurrentValues(): DamperValues;
    /**
     * Get the change in values since the last update call
     * @returns DamperValues object with the amount the values changed since the last `update()` call
     */
    getDeltaValues(): DamperValues;
    /**
     * Whether the damper has reached its target
     * @returns Whether the damper has reached its target (within permissible error range)
     */
    reachedTarget(): boolean;
}

export declare interface DamperProps {
    /**  Values to be dampened */
    values: DamperValues;
    /** Multiplier used on each update to approach the target value, should be between 0 and 1, where 1 is no damping */
    dampingFactor: number;
    /** Amount of permitted error before a value is considered to have 'reached' its target. Defaults to 0.001 */
    epsilon?: number;
}

export declare interface DamperValues {
    /** A value to dampen, set to its initial state  */
    [key: string]: number | null;
}

export declare interface DiscreteEvent {
    type: 'trigger';
}

/**
 * Event: Fired when attempting to go the the next/previous point of interest, but none exists
 * Fired on `StoryPointsControls` and `PathPointsControls`. `controls.addEventListener('ExitPOIs', ...)`
 * */
export declare interface ExitPOIsEvent {
    type: 'ExitPOIs';
    exitFrom: 'start' | 'end';
}

/**
 * Control scheme to move the camera with arrow/WASD keys and mouse wheel; and rotate the camera with click-and-drag events.
 * @remarks
 * Control scheme to move the camera with arrow/WASD keys and mouse wheel; and rotate the camera with click-and-drag events.
 *  On a touch device, 1 finger swipe rotates the camera, and 2 fingers tranlsate/move the camera.
 *
 *
 *  Note: CSS property `touch-action: none` will probably be needed on listener element.
 *
 * See {@link three-story-controls#FreeMovementControlsProps} for all properties that can be passed to the constructor.
 *
 * {@link https://nytimes.github.io/three-story-controls/examples/demos/freemove | DEMO }
 *
 * @example
 * ```js
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new FreeMovementControls(cameraRig)
 *
 * controls.enable()
 *
 * // render loop
 * function animate(t) {
 *  controls.update(t)
 * }
 * ```
 *
 */
export declare class FreeMovementControls implements BaseControls {
    readonly cameraRig: CameraRig;
    private keyboardAdaptor;
    private wheelAdaptor;
    private pointerAdaptor;
    private wheelScaleFactor;
    private pointerScaleFactor;
    private panDegreeFactor;
    private tiltDegreeFactor;
    private enabled;
    /** {@inheritDoc three-story-controls#FreeMovementControlsProps#} */
    constructor(cameraRig: CameraRig, props?: FreeMovementControlsProps);
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    private onWheel;
    private onKey;
    private onPointer;
    update(time: number): void;
}

/**
 * Properties that can be passed to the {@link three-story-controls#FreeMovementControls} constructor
 */
export declare interface FreeMovementControlsProps {
    domElement?: HTMLElement;
    /** Damping factor between 0 and 1. Defaults to 0.3 */
    pointerDampFactor?: number;
    /** Mutiplier for two-pointer translation. Defaults to 4 */
    pointerScaleFactor?: number;
    /** Damping factor between 0 and 1. Defaults to 0.5 */
    keyboardDampFactor?: number;
    /** Mutiplier for keyboard translation. Defaults to 0.5 */
    keyboardScaleFactor?: number;
    /** Damping factor between 0 and 1. Defaults to 0.25 */
    wheelDampFactor?: number;
    /** Mutiplier for wheel translation. Defaults to 0.05 */
    wheelScaleFactor?: number;
    /** Mutiplier for panning. Defaults to Math.PI / 4 */
    panDegreeFactor?: number;
    /** Mutiplier for tilting. Defaults to Math.PI / 10 */
    tiltDegreeFactor?: number;
}

export declare interface IntertiaCompleteEvent {
    type: 'inertiacomplete';
}

/**
 * Parse keyboard events and emit either dampened values for continuous keypresses, or trigger events named according to a provided keymapping.
 * @remarks
 * See {@link three-story-controls#KeyboardAdaptorProps} for all properties that can be passed to the constructor.
 * See {@link three-story-controls#KeyboardAdaptorDiscreteEvent} and {@link three-story-controls#KeyboardAdaptorContinuousEvent} for emitted event signatures.
 * @example Continuous adaptor
 * ```javascript
 * const keyboardAdaptor = new KeyboardAdaptor({ type: 'continuous', dampingFactor: 0.2 })
 * keyboardAdaptor.connect()
 * keyboardAdaptor.addEventListener('update', (event) => {
 *   cube.rotation.y += event.deltas.right - event.deltas.left
 *   cube.rotation.x += event.deltas.up - event.deltas.down
 * )}
 * function animate() {
 *  keyboardAdaptor.update()
 *  window.requestAnimationFrame(animate)
 * }
 * animate()
 * ```
 */
export declare class KeyboardAdaptor extends BaseAdaptor {
    private type;
    private damper;
    private dampingFactor;
    private incrementor;
    private keyMapping;
    private connected;
    private preventBubbling;
    constructor(props: KeyboardAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    private onKeyUp;
    private onKeyDown;
}

/**
 * Event: Fired when a key in a `continuous` KeyboardAdaptor's mapping is pressed (`onKeyDown`)
 * @example
 * ```javascript
 * adaptor.on('update', () => { // do something })
 * ```
 * */
export declare interface KeyboardAdaptorContinuousEvent extends ContinuousEvent {
    values: DamperValues;
    deltas: DamperValues;
}

/**
 * Event: Fired when a key in a `discrete` KeyboardAdaptor's mapping is released (`onKeyUp`)
 * @example
 * ```javascript
 * adaptor.on('trigger', () => { // do something })
 * ```
 * */
export declare interface KeyboardAdaptorDiscreteEvent extends DiscreteEvent {
    /** KeyMapping key that triggered the event */
    trigger: string;
}

/**
 * Properties that can be passed to the {@link three-story-controls#KeyboardAdaptor} constructor
 */
export declare interface KeyboardAdaptorProps {
    /** 'discrete' or 'continuous' */
    type: KeyboardAdaptorType;
    /**
     * Default key mapping uses forward/backward/up/down/left/right as semanic labels, with WASD and arrow keys mapped appropriately:
     * @example keyMapping
     * ```javascript
     * {
     *   forward: ['ArrowUp', 'w', 'W'],
     *   backward: ['ArrowDown', 's', 'S'],
     *   left: ['ArrowLeft', 'a', 'A'],
     *   right: ['ArrowRight', 'd', 'D'],
     *   up: ['u', 'U'],
     *   down: ['n', 'N'],
     * }
     * ```
     * */
    keyMapping?: KeyMapping;
    /** Only used for continuous adaptor, value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
    /** Only used for continuous adaptor, the amount to increment the target value on each keydown event. Defaults to 1 */
    incrementor?: number;
    /** Prevent event bubbling. Defaults to true */
    preventBubbling?: boolean;
}

/**
 * A discrete adaptor works as a trigger - only firing events on keyup,
 * whereas a continuous adaptor continuously fires events on keydown
 * */
export declare type KeyboardAdaptorType = 'discrete' | 'continuous';

/**
 * Key-value pairs of semantic labels associated with an array of keys (corresponding to `KeybordEvent.keys` values)
 */
export declare interface KeyMapping {
    /** The key is a semantic label, and the string[] is a corresponding collection of event.keys */
    [key: string]: string[];
}

export declare interface PathPointMarker {
    frame: number;
}

/**
 * Control scheme to transition the camera between specific points (frames) along a path specified through an `AnimationClip`.
 * @remarks
 * Control scheme to transition the camera between specific points (frames) along a path specified through an `AnimationClip`.
 *  A mouse wheel or swipe or keyboard arrow event triggers the camera to smoothly transition from one given frame number to the next.
 *
 *
 * Note: CSS property `touch-action: none` will probably be needed on listener element.
 *
 * See {@link three-story-controls#PathPointsControlsProps} for all properties that can be passed to the constructor.
 *
 * See {@link three-story-controls#PathPointMarker} for POI properties.
 *
 * See {@link three-story-controls#UpdatePOIsEvent} and {@link three-story-controls#ExitPOIsEvent} for emitted event signatures.
 *
 * {@link https://nytimes.github.io/three-story-controls/examples/demos/path-points/ | DEMO }
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
 *  cameraRig = new CameraRig(camera, scene)
 *  cameraRig.setAnimationClip(gltf.animations[0])
 *  cameraRig.setAnimationTime(0)
 *  controls = new PathPointsControls(cameraRig, pois)
 *  controls.enable()
 *  controls.addEventListener('ExitPOIs', (e) => {
 *    // e.exitFrom will be either 'start' or 'end'
 *  })
 *  controls.addEventListener('update', (e) => {
 *    // e.currentIndex will be the index of the starting poi
 *    // e.upcomingIndex will be the index of the upcoming poi
 *    // e.progress will be a number 0-1 indicating progress of the transition
 *  })
 * })
 * ```
 */
export declare class PathPointsControls extends EventDispatcher implements BaseControls {
    readonly cameraRig: CameraRig;
    private wheelAdaptor;
    private swipeAdaptor;
    private keyboardAdaptor;
    private pois;
    private currentIndex;
    private upcomingIndex;
    private enabled;
    private duration;
    private ease;
    private wheelThreshold;
    private swipeThreshold;
    private useKeyboard;
    constructor(cameraRig: CameraRig, pois?: PathPointMarker[], props?: PathPointsControlsProps);
    getCurrentIndex(): number;
    enable(): void;
    disable(): void;
    update(): void;
    isEnabled(): boolean;
    private onKey;
    private onTrigger;
    private updatePois;
    private onCameraStart;
    private onCameraUpdate;
    private onCameraEnd;
}

/**
 * Properties that can be passed to the {@link three-story-controls#PathPointsControls} constructor
 */
export declare interface PathPointsControlsProps {
    /** Threshold of wheel delta that triggers a transition. Defaults to 15 */
    wheelThreshold?: number;
    /** Threshold of swipe distance that triggers a transition. Defaults to 60 */
    swipeThreshold?: number;
    /** Transition duration, defaults to 1 */
    duration?: number;
    /** Transition easing, defaults to power1 */
    ease?: string;
    /** Use keyboard arrow keys as navigation, defaults to true */
    useKeyboard?: boolean;
}

/**
 * Parse pointer events to emit dampened, normalized coordinates along with the pointer count (for detecting multi-touch or drag events)
 * @remarks
 * See {@link three-story-controls#PointerAdaptorProps} for all properties that can be passed to the constructor.
 * See {@link three-story-controls#PointerAdaptorEvent} for emitted event signatures.
 * Note: CSS property `touch-action: none` will probably be needed on listener element.
 * @example Pointer adaptor
 * ```javascript
 * const pointerAdaptor = new PointerAdaptor()
 * pointerAdaptor.connect()
 * pointerAdaptor.addEventListener('update', (event) => {
 *  switch(event.pointerCount) {
 *    case 0:
 *      cube.scale.x = event.values.x
 *      cube.scale.y = event.values.y
 *      break
 *    case 1:
 *      cube.position.x += event.deltas.x
 *      cube.position.y -= event.deltas.y
 *      break
 *    default:
 *      break
 *  }
 * })
 *
 * // in RAF loop:
 * function animate(t) {
 *  pointerAdaptor.update(t)
 * }
 * ```
 */
export declare class PointerAdaptor extends BaseAdaptor {
    private domElement;
    private dampingFactor;
    private shouldNormalize;
    private normalizeAroundZero;
    private multipointerThreshold;
    private damper;
    private connected;
    private width;
    private height;
    private pointerCount;
    private recordedPosition;
    private cache;
    private lastDownTime;
    private lastUpTime;
    constructor(props: PointerAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(time: number): void;
    isEnabled(): boolean;
    private setDimensions;
    private getPointerPosition;
    private normalize;
    private onPointerMove;
    private onPointerDown;
    private onPointerUp;
    private onResize;
}

/**
 * Event: Fired when when `PointerEvent`s are triggered
 * @example
 * ```javascript
 * adaptor.on('trigger', (e) => {
 *   console.log('x/y coordinates', e.values.x, e.values.y)
 * })
 * ```
 * */
export declare interface PointerAdaptorEvent extends ContinuousEvent {
    /** Dampened x and y pointer coordinates */
    values: Coordinates;
    /** Pointer coordinate change since previous update */
    deltas: Coordinates;
    /** Number of pointers registered */
    pointerCount: number;
}

/**
 * Properties that can be passed to the {@link three-story-controls#PointerAdaptor} constructor
 */
export declare interface PointerAdaptorProps {
    /** DOM element that should listen for pointer events. Defaults to `document.body` */
    domElement?: HTMLElement;
    /** Damping value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
    /** Whether to normalize the pointer position values. Defaults to true */
    shouldNormalize?: boolean;
    /** If values are normalized, whether they should be in -1 to 1 range. Defaults to true. */
    normalizeAroundZero?: boolean;
    /** Debounce for registering a change in the pointer count, in ms. Defaults to 100. */
    multipointerThreshold?: number;
}

/**
 * Enum of {@link three-story-controls#CameraRig} parts
 */
export declare enum RigComponent {
    Body = "body",
    Head = "head",
    Eyes = "eyes"
}

/**
 * ScrollActions provide a way to add custom callback hooks for specific parts of the scroll area
 */
export declare interface ScrollAction {
    /** When to start the action, in %, px or vh. */
    start: string;
    /** When to end the action, in %, px or vh. */
    end: string;
    /** Callback with 0-1 progress when element is between start and end conditions.  */
    callback: (progress: number) => void;
    /** @internal */
    startPx: number;
    /** @internal */
    endPx: number;
    /** @internal */
    bufferedStartPx: number;
    /** @internal */
    bufferedEndPx: number;
}

/**
 * Emits normalized values for the amount a given DOM element has been scrolled through.
 * @remarks
 * See {@link three-story-controls#ScrollAdaptorProps} for all properties that can be passed to the constructor.
 * See {@link three-story-controls#ScrollAdaptorEvent} for emitted event signatures.
 * @example Scroll adaptor
 * ```javascript
 * const scrollAdaptor = new ScrollAdaptor({ scrollElement: document.querySelector('.scroller'), dampingFactor: 0.1 })
 * scrollAdaptor.connect()
 * scrollAdaptor.addEventListener('update', (event) => {
 *   cube.rotation.y = event.dampenedValues.scrollPercent*Math.PI*2
 * })
 * ```
 */
export declare class ScrollAdaptor extends BaseAdaptor {
    private scrollElement;
    private damper;
    private dampingFactor;
    private connected;
    private values;
    private lastSeenScrollValue;
    private previousScrollValue;
    private startPosition;
    private endPosition;
    private distance;
    private bufferedStartPosition;
    private bufferedEndPosition;
    private startOffset;
    private endOffset;
    private buffer;
    private resizeObserver;
    constructor(props: ScrollAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    parseOffset(offset: string): number;
    private calculateOffset;
    private calculateDimensions;
    private onScroll;
}

/**
 * Event: Fired when when the 'in view' amount of the given DOM element changes
 */
export declare interface ScrollAdaptorEvent extends ContinuousEvent {
    values: DamperValues;
    dampenedValues: DamperValues;
}

/**
 * Properties that can be passed to the {@link three-story-controls#ScrollAdaptor} constructor
 */
export declare interface ScrollAdaptorProps {
    /** Long DOM Element to observe */
    scrollElement: HTMLElement;
    /** Offset to start registering scroll, in px or vh. Default starts when top of element is at bottom of viewport. */
    startOffset?: string;
    /** Offset to end registering scroll, in px or vh. Default ends when bottom of element is at top of viewport. */
    endOffset?: string;
    /** Buffer before and after element to start registering scroll. Number between 0 and 1, defaults to 0.1 */
    buffer?: number;
    /** Value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
}

/**
 * Control scheme to scrub through the CameraRig's `AnimationClip` based on the scroll of a DOM Element
 * @remarks
 * Control scheme to scrub through the CameraRig's `AnimationClip` based on the scroll of a DOM Element.
 *  These controls expect to observe an element that is a few viewports long, and use the scroll distance to scrub through a camera animation.
 *  By default, the 'start' of the animation is when the element starts to be in view (ie the top of the element aligns with the bottom of the viewport),
 *  and the 'end' is when the element goes out of view (when the bottom of the elements aligns with the top of the viewport).
 *  These trigger points can be customised with the `cameraStart` and `cameraEnd` properties. Additional scroll-dependant procedures can also be defined through `scrollActions`.
 *
 *
 * See {@link three-story-controls#ScrollControlsProps} for all properties that can be passed to the constructor.
 *
 * {@link https://nytimes.github.io/three-story-controls/examples/demos/scroll-controls/ | DEMO }
 *
 * @example
 * ```js
 * const scene = new Scene()
 * const gltfLoader = new GLTFLoader()
 * const camera = new PerspectiveCamera()
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new ScrollControls(cameraRig, {
 *  scrollElement: document.querySelector('.scroller'),
 *  cameraStart: '12%',
 *  cameraEnd: '90%',
 *  scrollActions: [
 *    { start: '0%' , end: '10%', callback: e => fadeInElement(e) },
 *    { start: '85%' , end: '100%', callback: e => fadeOutElement(e) }
 *  ]
 * })
 *
 * function fadeInElement(progress) { // entry fade transition }
 * function fadeOutElement(progress) { // exit fade transition }
 *
 * gltfLoader.load(cameraPath, (gltf) => {
 *  cameraRig.setAnimationClip(gltf.animations[0])
 *  cameraRig.setAnimationTime(0)
 *  controls.enable()
 * })
 *
 * // render loop
 * function animate() {
 *  controls.update()
 * }
 * ```
 */
export declare class ScrollControls implements BaseControls {
    readonly cameraRig: CameraRig;
    private scrollAdaptor;
    private enabled;
    private cameraStart;
    private cameraEnd;
    private cameraStartPx;
    private cameraEndPx;
    private cameraBufferedStartPx;
    private cameraBufferedEndPx;
    private scrollActions;
    private buffer;
    constructor(cameraRig: CameraRig, props: ScrollControlsProps);
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    update(): void;
    private calculateStops;
    private onScroll;
}

/**
 * Properties that can be passed to the {@link three-story-controls#ScrollControls} constructor
 */
export declare interface ScrollControlsProps {
    /** Long DOM Element to observe */
    scrollElement: HTMLElement;
    /** Offset to start registering scroll, in px or vh. Default starts when top of element is at bottom of viewport. */
    startOffset?: string;
    /** Offset to end registering scroll, in px or vh. Default ends when bottom of element is at top of viewport. */
    endOffset?: string;
    /** Value between 0 and 1. Defaults to 1 */
    dampingFactor?: number;
    /** Buffer before and after element to start registering scroll. Number (percentage) between 0 and 1, defaults to 0.1 */
    buffer?: number;
    /** When in the scroll to start the camera animation, can be specified in px, % or vh */
    cameraStart?: string;
    /** When in the scroll to end the camera animation, can be specified in px, % or vh */
    cameraEnd?: string;
    /** Array of ScrollActions for custom scroll hooks  */
    scrollActions: ScrollAction[];
}

export declare interface StoryPointMarker {
    /** Camera position */
    position: Vector3;
    /** Camera quaternion */
    quaternion: Quaternion;
    /** Transition duration, defaults to 1 */
    duration?: number;
    /** Transition easing, defaults to power1 */
    ease?: string;
    /** Use spherical interpolation for rotation, defaults to true */
    useSlerp?: boolean;
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
export declare class StoryPointsControls extends EventDispatcher implements BaseControls {
    readonly cameraRig: CameraRig;
    private keyboardAdaptor;
    private pois;
    private currentIndex;
    private upcomingIndex;
    private enabled;
    private cycle;
    private useKeyboard;
    constructor(cameraRig: CameraRig, pois?: StoryPointMarker[], props?: StoryPointsControlsProps);
    getCurrentIndex(): number;
    nextPOI(): void;
    prevPOI(): void;
    goToPOI(index: number): void;
    enable(): void;
    disable(): void;
    update(): void;
    isEnabled(): boolean;
    private updatePois;
    private onCameraStart;
    private onCameraUpdate;
    private onCameraEnd;
    private onKey;
}

/**
 * Properties that can be passed to the {@link three-story-controls#StoryPointsControls} constructor
 */
export declare interface StoryPointsControlsProps {
    /** Whether to cycle to the first/last POI after reaching the end/start. When false, controls with emit 'ExitStoryPoints' events. Defaults to false. */
    cycle?: boolean;
    /** Use keyboard arrow keys as navigation, defaults to true */
    useKeyboard?: boolean;
}

/**
 * Emits events in response to swipe gestures above a given threshold.
 * @remarks
 * See {@link three-story-controls#SwipeAdaptorProps} for all properties that can be passed to the constructor.
 * See {@link three-story-controls#SwipeAdaptorEvent} for emitted event signatures.
 * Note: CSS property `touch-action: none` will probably be needed on listener element
 * @example Swipe adaptor
 * ```javascript
 * const swipeAdaptor = new SwipeAdaptor()
 * swipeAdaptor.connect()
 * swipeAdaptor.addEventListener('trigger', (event) => {
 *   cube.scale.y += event.y*0.1
 * })
 * ```
 */
export declare class SwipeAdaptor extends BaseAdaptor {
    private domElement;
    private thresholdX;
    private thresholdY;
    private startX;
    private startY;
    private connected;
    constructor(props?: SwipeAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    private onPointerDown;
    private onPointerUp;
}

/**
 * Event: Fired when when swipe are registered
 * @remarks
 * The sign represents the direction of the swipe,
 * y = 1 when swiping down-to-up, and x = 1 when swiping left-to-right
 * */
export declare interface SwipeAdaptorEvent extends DiscreteEvent {
    x: -1 | 1 | 0;
    y: -1 | 1 | 0;
}

/**
 * Properties that can be passed to the {@link three-story-controls#SwipeAdaptor} constructor
 */
export declare interface SwipeAdaptorProps {
    /** DOM element to listen to events on. Defaults to document.body */
    domElement?: HTMLElement;
    /** Threshold of pointer's deltaX to trigger events. Defaults to 60 */
    thresholdX?: number;
    /** Threshold of pointer's deltaY to trigger events. Defaults to 60 */
    thresholdY?: number;
}

/**
 * Control scheme for slight rotation and translation movement in response to mouse movements (designed to be used in conjunction with other control schemes)
 * @remarks
 * Note: CSS property `touch-action: none` will probably be needed on listener element
 *
 * See {@link three-story-controls#ThreeDOFControlsProps} for all properties that can be passed to the constructor.
 *
 * {@link https://nytimes.github.io/three-story-controls/examples/demos/story-points/ | DEMO w/ story points }
 *
 * {@link https://nytimes.github.io/three-story-controls/examples/demos/scroll-controls/ | DEMO w/ scroll controls}
 *
 * @example
 * ```js
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new ThreeDOFControls(cameraRig)
 *
 * controls.enable()
 *
 * // render loop
 * function animate(t) {
 *  controls.update(t)
 * }
 * ```
 */
export declare class ThreeDOFControls implements BaseControls {
    readonly cameraRig: CameraRig;
    private pointerAdaptor;
    private enabled;
    private panFactor;
    private tiltFactor;
    private truckFactor;
    private pedestalFactor;
    constructor(cameraRig: CameraRig, props?: ThreeDOFControlsProps);
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    update(time: number): void;
    private onPointerMove;
}

/**
 * Properties that can be passed to the {@link three-story-controls#ThreeDOFControls} constructor
 */
export declare interface ThreeDOFControlsProps {
    /** DOM element that should listen for pointer events. Defaults to `document.body` */
    domElement?: HTMLElement;
    /** Mutiplier for panning. Defaults to Math.PI / 20 */
    panFactor?: number;
    /** Mutiplier for tilting. Defaults to Math.PI / 20 */
    tiltFactor?: number;
    /** Mutiplier for truck translation. Defaults to 1 */
    truckFactor?: number;
    /** Mutiplier for pedestal translation. Defaults to 1 */
    pedestalFactor?: number;
    /** Damping factor between 0 and 1. Defaults to 0.7 */
    dampingFactor?: number;
}

/**
 * Describe whether rig should translate along current rotation in each action axis
 */
export declare interface TranslateGuide {
    [CameraAction.Pan]: boolean;
    [CameraAction.Tilt]: boolean;
    [CameraAction.Roll]: boolean;
}

/**
 * Event: Fired when transitioning between points of interest. Fired on `StoryPointsControls` and `PathPointsControls`. `controls.addEventListener('update', ...)`
 * */
export declare interface UpdatePOIsEvent {
    type: 'update';
    currentIndex: number;
    upcomingIndex: number;
    progress: number;
}

/**
 * Parse mouse wheel events and emit either dampened values, or trigger events for swipes that cross a given threshold.
 * @remarks
 * See {@link three-story-controls#WheelAdaptorProps} for all properties that can be passed to the constructor.
 * See {@link three-story-controls#WheelAdaptorDiscreteEvent} and {@link three-story-controls#WheelAdaptorContinuousEvent} for emitted event signatures.
 * @example Discrete adaptor
 * ```javascript
 * const wheelAdaptor = new WheelAdaptor({ type: 'discrete' })
 * wheelAdaptor.connect()
 * wheelAdaptor.addEventListener('trigger', (event) => {
 *   cube.scale.y += event.y*0.1
 * })
 * ```
 */
export declare class WheelAdaptor extends BaseAdaptor {
    private type;
    private domElement;
    private dampingFactor;
    private damper;
    private thresholdX;
    private thresholdY;
    private debounceDuration;
    private lastThresholdTrigger;
    private connected;
    constructor(props: WheelAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    private onWheel;
}

/**
 * Event: Fired on a continuous `WheelAdaptor` in response to `wheel` events
 * @remarks
 * DamperValues have `x` and `y` keys.
 * */
export declare interface WheelAdaptorContinuousEvent extends ContinuousEvent {
    values: DamperValues;
    deltas: DamperValues;
}

/**
 * Event: Fired when when discrete `wheel` events are registered
 * @remarks
 * The sign represents the the direction of the wheel event that caused the event to trigger
 * */
export declare interface WheelAdaptorDiscreteEvent extends DiscreteEvent {
    x: -1 | 1 | 0;
    y: -1 | 1 | 0;
}

/**
 * Properties that can be passed to the {@link three-story-controls#WheelAdaptor} constructor
 */
export declare interface WheelAdaptorProps {
    /** 'discrete' or 'continuous' */
    type: WheelAdaptorType;
    /** DOM element to listen to events on. Defaults to window */
    domElement?: HTMLElement;
    /** Only used for continuous adaptor, value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
    /** Only used for discrete adaptor, threshold of wheel.deltaX to trigger events. Defaults to 15 */
    thresholdX?: number;
    /** Only used for discrete adaptor, threshold of wheel.deltaY to trigger events. Defaults to 15 */
    thresholdY?: number;
    /** Only used for discrete adaptor, rest duration between firing trigger events. Defaults to 700 */
    debounceDuration?: number;
}

/**
 * A discrete adaptor works as a trigger - only firing events when wheel events pass a given threshold,
 * whereas a continuous adaptor continuously fires events on wheel
 * */
export declare type WheelAdaptorType = 'discrete' | 'continuous';

export { }

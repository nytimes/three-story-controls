import { AnimationClip } from 'three';
import { Camera } from 'three';
import { EventDispatcher } from 'three';
import { Quaternion } from 'three';
import { Scene } from 'three';
import { Vector3 } from 'three';

export declare enum Axis {
    X = "X",
    Y = "Y",
    Z = "Z"
}

export declare abstract class BaseAdaptor extends EventDispatcher {
    constructor();
    abstract connect(): void;
    abstract disconnect(): void;
    abstract update(time?: number): void;
    abstract isEnabled(): boolean;
}

declare interface BaseControls {
    enable(): void;
    disable(): void;
    update(time?: number): void;
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

/**
 * Event: Fired when CameraRig ends a transition
 * @example
 * ```javascript
 * rig.on('CameraMoveEnd', (e) => {
 *   // do something
 * })
 * ```
 * */
export declare interface CameraMoveEndEvent {
    type: 'CameraMoveEnd';
}

/**
 * Event: Fired when CameraRig starts a transition
 * @example
 * ```javascript
 * rig.on('CameraMoveStart', () => {
 *   // do something
 * })
 * ```
 * */
export declare interface CameraMoveStartEvent {
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
export declare interface CameraMoveUpdateEvent {
    type: 'CameraMoveUpdate';
    /** Percentage of transition completed, between 0 and 1. */
    progress: number;
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

declare interface CameraRigProps {
    upAxis?: Axis;
    preventActionsWhileTransitioning?: boolean;
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
     * @param value Number to reset all damper values to
     */
    resetAll(value: number): void;
    /**
     * Reset damper values as described by the given DamperValues object
     * @param values DamperValues object to reset the damper to
     */
    resetData(values: DamperValues): void;
    /**
     * @returns DamperValues object with the current values of the damper
     */
    getCurrentValues(): DamperValues;
    /**
     * @returns DamperValues object with the amount the values changed since the last `update()` call
     */
    getDeltaValues(): DamperValues;
    /**
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
 * Payload signature for event fired on user input when there
 * is no next/prev POI to go to
 * */
export declare interface ExitPathPointsEvent {
    type: 'ExitPathPoints';
    exitFrom: 'start' | 'end';
}

/**
 * Payload signature for event fired when nextPOI/prevPOI are invoked
 * when at last/first POI (ie there is no POI to go to)
 * */
export declare interface ExitStoryPointsEvent {
    type: 'ExitStoryPoints';
    exitFrom: 'start' | 'end';
}

/**
 * Control scheme to move the camera with arrow/WASD keys and mouse wheel; and rotate the camera with click-and-drag events.
 * @example
 * ```js
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new FreeMovementControls(cameraRig)
 *
 * controls.enable()
 * function animate(t) {
 *  // render loop
 *  controls.update(t)
 * }
 * ```
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
    constructor(cameraRig: CameraRig, props?: FreeMovementControlsProps);
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    private onWheel;
    private onKey;
    private onPointer;
    update(time: number): void;
}

export declare interface FreeMovementControlsProps {
    domElement?: HTMLElement;
    pointerDampFactor?: number;
    keyboardDampFactor?: number;
    wheelDampFactor?: number;
    keyboardScaleFactor?: number;
    wheelScaleFactor?: number;
    pointerScaleFactor?: number;
    panDegreeFactor?: number;
    tiltDegreeFactor?: number;
}

export declare interface IntertiaCompleteEvent {
    type: 'inertiacomplete';
}

/**
 * Parse keyboard events and emit either dampened values for continuous keypresses, or trigger events named according to a provided keymapping.
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
 * adaptor.on('update', () => {
 *   // do something
 * })
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
 * adaptor.on('trigger', () => {
 *   // do something
 * })
 * ```
 * */
export declare interface KeyboardAdaptorDiscreteEvent extends DiscreteEvent {
    /** KeyMapping key that triggered the event */
    trigger: string;
}

export declare interface KeyboardAdaptorProps {
    type: KeyboardAdaptorType;
    /**
     * Default key mapping uses up/down/left/right as semanic labels, with WASD and arrow keys mapped appropriately:
     * @example keyMapping
     * ```javascript
     * {
     *   up: ['ArrowUp', 'w', 'W'],
     *   down: ['ArrowDown', 's', 'S'],
     *   left: ['ArrowLeft', 'a', 'A'],
     *   right: ['ArrowRight', 'd', 'D'],
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

export declare interface KeyMapping {
    /** The key is a semantic label, and the string[] is a corresponding collection of event.keys */
    [key: string]: string[];
}

export declare interface PathPointMarker {
    frame: number;
}

/**
 * Control scheme to transition the camera between specific points (frames) along a path specified through an `AnimationClip`.
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
 *  cameraRig = new CameraRig(gltf.cameras[0], scene, { animationClip: gltf.animations[0] })
 *  controls = new PathPointsControls(cameraRig, pois)
 *  pois[0].show(1)
 *  controls.enable()
 *  controls.addEventListener('ExitPathPoints', (e) => {
 *    alert(`Exit path points from _${e.exitFrom}_ event fired`)
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

export declare interface PathPointsControlsProps {
    /** Threshold of wheel delta that triggers a transition. Defaults to 15 */
    wheelThreshold?: number;
    /** Threshold of swipe distance that triggers a transition. Defaults to 60 */
    swipeThreshold?: number;
    /** Transition duration, defaults to 1 */
    duration?: number;
    /** Transition easing, defaults to power1 */
    ease?: string;
}

/**
 * Parse pointer events to emit dampened, normalized coordinates along with the pointer count (for detecting multi-touch or drag events)
 * @remarks
 * Note: CSS property `touch-action: none` will probably be needed on listener element
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
    private damper;
    private dampingFactor;
    private connected;
    private domElement;
    private shouldNormalize;
    private normalizeAroundZero;
    private width;
    private height;
    private pointerCount;
    private recordedPosition;
    private cache;
    private lastDownTime;
    private lastUpTime;
    private multipointerThreshold;
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
 * Emits normalized values for the amount a given DOM element has been scrolled through.
 * @example Scroll adaptor
 * ```javascript
 * const scrollAdaptor = new WheelAdaptor({ scrollElement: document.querySelector('.scroller'), dampingFactor: 0.1 })
 * scrollAdaptor.connect()
 * scrollAdaptor.addEventListener('update', (event) => {
 *   cube.rotation.y = event.total*Math.PI*2
 * })
 * ```
 */
export declare class ScrollAdaptor extends BaseAdaptor {
    private scrollElement;
    private scrollParent;
    private observer;
    private damper;
    private dampingFactor;
    private connected;
    private isIntersecting;
    private values;
    private lastSeenScrollValue;
    constructor(props: ScrollAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    private normalize;
    private onIntersected;
}

/**
 * Payload signature for a scroll event. Includes true and dampened values,
 * incase real time values are needed
 */
export declare interface ScrollAdaptorEvent extends ContinuousEvent {
    values: ScrollPercentages;
    dampenedValues: ScrollPercentages;
}

export declare interface ScrollAdaptorProps {
    /** Long DOM Element to observe */
    scrollElement: HTMLElement;
    /** Scroll element's parent, to gather scroll values from. Defaults to window */
    scrollParent?: HTMLElement;
    /** Value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
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
export declare class ScrollControls implements BaseControls {
    readonly cameraRig: CameraRig;
    private scrollAdaptor;
    private enabled;
    constructor(cameraRig: CameraRig, props: ScrollControlsProps);
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    update(): void;
    private onScroll;
}

export declare interface ScrollControlsProps {
    scrollElement: HTMLElement;
    scrollParent?: HTMLElement;
    dampingFactor?: number;
}

/**
 * Each property has a 0-1 value, representing the area that has scrolled into view.
 * `head` is percentage the first 100vh of the scroll div,
 * `foot` is the last 100vh, and `body` is the area in between. `total` represents
 * the percentage scrolled of the entire div.
 * */
export declare interface ScrollPercentages extends DamperValues {
    head: number;
    body: number;
    foot: number;
    total: number;
}

export declare interface StoryPointMarker {
    lookAtPosition: Vector3;
    lookAtOrientation: Quaternion;
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
export declare class StoryPointsControls extends EventDispatcher implements BaseControls {
    readonly cameraRig: CameraRig;
    private pois;
    private currentIndex;
    private upcomingIndex;
    private enabled;
    private cycle;
    private duration;
    private ease;
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
}

export declare interface StoryPointsControlsProps {
    /**
     * Whether to cycle to the first/last POI after reaching the end/start.
     * When false, controls with emit 'ExitStoryPoints' events. Defaults to false.
     * */
    cycle?: boolean;
    /** Transition duration, defaults to 1 */
    duration?: number;
    /** Transition easing, defaults to power1 */
    ease?: string;
}

/**
 * Emits events in response to swipe gestures above a given threshold.
 * @remarks
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
 * Payload signature for a swipe event.
 * The sign represents the direction of the swipe,
 * y = 1 when swiping down-to-up, and x = 1 when swiping left-to-right
 * */
export declare interface SwipeAdaptorEvent extends DiscreteEvent {
    x: -1 | 1 | 0;
    y: -1 | 1 | 0;
}

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
 * @example
 * ```js
 * const scene = new Scene()
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
 * const cameraRig = new CameraRig(camera, scene)
 * const controls = new ThreeDOFControls(cameraRig)
 *
 * controls.enable()
 * function animate(t) {
 *  // render loop
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
    private dampingFactor;
    constructor(cameraRig: CameraRig, props?: ThreeDOFControlsProps);
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    update(time: number): void;
    private onPointerMove;
}

export declare interface ThreeDOFControlsProps {
    panFactor?: number;
    tiltFactor?: number;
    truckFactor?: number;
    pedestalFactor?: number;
    dampingFactor?: number;
}

export declare interface TranslateGuide {
    [CameraAction.Pan]: boolean;
    [CameraAction.Tilt]: boolean;
    [CameraAction.Roll]: boolean;
}

/**
 * Parse mouse wheel events and emit either dampened values, or trigger events for swipes that cross a given threshold.
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
 * Payload signature for a continuous wheel event.
 * DamperValues have `x` and `y` keys.
 */
export declare interface WheelAdaptorContinuousEvent extends ContinuousEvent {
    values: DamperValues;
    deltas: DamperValues;
}

/**
 * Payload signature for a discrete wheel event.
 * The sign represents the direction of the wheel event that caused the event to trigger
 * */
export declare interface WheelAdaptorDiscreteEvent extends DiscreteEvent {
    x: -1 | 1 | 0;
    y: -1 | 1 | 0;
}

export declare interface WheelAdaptorProps {
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

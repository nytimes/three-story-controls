import { BaseControls } from './BaseControls';
import { CameraRig } from '../CameraRig';
/**
 * Properties that can be passed to the {@link three-story-controls#FreeMovementControls} constructor
 */
export interface FreeMovementControlsProps {
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
//# sourceMappingURL=FreeMovementControls.d.ts.map
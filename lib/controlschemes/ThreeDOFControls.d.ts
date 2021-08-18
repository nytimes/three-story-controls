import { BaseControls } from './BaseControls';
import { CameraRig } from '../CameraRig';
/**
 * Properties that can be passed to the {@link three-story-controls#ThreeDOFControls} constructor
 */
export interface ThreeDOFControlsProps {
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
//# sourceMappingURL=ThreeDOFControls.d.ts.map
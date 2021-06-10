import { BaseControls } from './BaseControls';
import { CameraRig } from '../CameraRig';
export interface FreeMovementControlsProps {
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
//# sourceMappingURL=FreeMovementControls.d.ts.map
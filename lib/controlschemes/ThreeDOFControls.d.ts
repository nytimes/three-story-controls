import { BaseControls } from './BaseControls';
import { CameraRig } from '../CameraRig';
export interface ThreeDOFControlsProps {
    panFactor?: number;
    tiltFactor?: number;
    truckFactor?: number;
    pedestalFactor?: number;
    dampingFactor?: number;
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
//# sourceMappingURL=ThreeDOFControls.d.ts.map
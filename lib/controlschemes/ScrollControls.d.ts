import { BaseControls } from './BaseControls';
import { CameraRig } from '../CameraRig';
export interface ScrollControlsProps {
    scrollElement: HTMLElement;
    scrollParent?: HTMLElement;
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
//# sourceMappingURL=ScrollControls.d.ts.map
import { EventDispatcher } from 'three';
import { BaseControls } from './BaseControls';
import { CameraRig } from '../CameraRig';
export interface PathPointMarker {
    frame: number;
}
/**
 * Properties that can be passed to the {@link @threebird/controls#PathPointsControls} constructor
 */
export interface PathPointsControlsProps {
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
 * Control scheme to transition the camera between specific points (frames) along a path specified through an `AnimationClip`.
 * @remarks
 * Note: CSS property `touch-action: none` will probably be needed on listener element
 * See {@link @threebird/controls#PathPointsControlsProps} for all properties that can be passed to the constructor.
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
 *  controls.addEventListener('ExitPOIs', (e) => {
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
//# sourceMappingURL=PathPointsControls.d.ts.map
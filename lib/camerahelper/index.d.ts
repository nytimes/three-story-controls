import { CameraRig } from '../CameraRig';
import { FreeMovementControls } from '../controlschemes/FreeMovementControls';
import './index.css';
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
//# sourceMappingURL=index.d.ts.map
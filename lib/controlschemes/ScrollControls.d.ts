import { BaseControls } from './BaseControls';
import { CameraRig } from '../CameraRig';
/**
 * ScrollActions provide a way to add custom callback hooks for specific parts of the scroll area
 */
export interface ScrollAction {
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
 * Properties that can be passed to the {@link three-story-controls#ScrollControls} constructor
 */
export interface ScrollControlsProps {
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
//# sourceMappingURL=ScrollControls.d.ts.map
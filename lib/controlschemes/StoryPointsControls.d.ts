import { EventDispatcher, Vector3, Quaternion } from 'three';
import { BaseControls } from './BaseControls';
import { CameraRig } from '../CameraRig';
export interface StoryPointMarker {
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
 * Properties that can be passed to the {@link three-story-controls#StoryPointsControls} constructor
 */
export interface StoryPointsControlsProps {
    /** Whether to cycle to the first/last POI after reaching the end/start. When false, controls with emit 'ExitStoryPoints' events. Defaults to false. */
    cycle?: boolean;
    /** Use keyboard arrow keys as navigation, defaults to true */
    useKeyboard?: boolean;
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
//# sourceMappingURL=StoryPointsControls.d.ts.map
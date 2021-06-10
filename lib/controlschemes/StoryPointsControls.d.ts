import { EventDispatcher, Vector3, Quaternion } from 'three';
import { BaseControls } from './BaseControls';
import { CameraRig } from '../CameraRig';
export interface StoryPointMarker {
    lookAtPosition: Vector3;
    lookAtOrientation: Quaternion;
}
/**
 * Payload signature for event fired when nextPOI/prevPOI are invoked
 * when at last/first POI (ie there is no POI to go to)
 * */
export interface ExitStoryPointsEvent {
    type: 'ExitStoryPoints';
    exitFrom: 'start' | 'end';
}
export interface StoryPointsControlsProps {
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
//# sourceMappingURL=StoryPointsControls.d.ts.map
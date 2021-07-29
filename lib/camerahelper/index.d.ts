import { Quaternion, Vector3 } from 'three';
import { CameraRig } from '../CameraRig';
import { FreeMovementControls } from '../controlschemes/FreeMovementControls';
import './index.css';
interface POI {
    position: Vector3;
    quaternion: Quaternion;
    duration: number;
    ease: string;
    image: string;
}
export declare class CameraHelper {
    readonly rig: CameraRig;
    readonly controls: FreeMovementControls;
    readonly canvas: HTMLCanvasElement;
    private pois;
    private currentIndex;
    private drawer;
    private domList;
    private collapseBtn;
    private doCapture;
    private animationClip;
    private isPlaying;
    private playStartTime;
    constructor(rig: CameraRig, controls: FreeMovementControls, canvas: HTMLCanvasElement, canvasParent?: HTMLElement);
    capture(): void;
    update(time: number): void;
    addPoi(image: string): void;
    updatePoi(index: number, props: Partial<POI>): void;
    movePoi(index: number, direction: number): void;
    removePoi(index: number): void;
    goToPoi(index: number): void;
    createClip(): void;
    scrubClip(amount: number): void;
    playClip(): void;
    export(): void;
    exportImages(): void;
    initUI(canvasParent?: HTMLElement): void;
    handleEvents(event: any): void;
    collapse(): void;
    render(): void;
}
export {};
//# sourceMappingURL=index.d.ts.map
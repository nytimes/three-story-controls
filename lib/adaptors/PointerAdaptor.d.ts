import { BaseAdaptor, ContinuousEvent } from './BaseAdaptor';
import { DamperValues } from '../Damper';
interface Coordinates extends DamperValues {
    x: number;
    y: number;
}
/**
 * Event: Fired when when `PointerEvent`s are triggered
 * @example
 * ```javascript
 * adaptor.on('trigger', (e) => {
 *   console.log('x/y coordinates', e.values.x, e.values.y)
 * })
 * ```
 * */
export interface PointerAdaptorEvent extends ContinuousEvent {
    /** Dampened x and y pointer coordinates */
    values: Coordinates;
    /** Pointer coordinate change since previous update */
    deltas: Coordinates;
    /** Number of pointers registered */
    pointerCount: number;
}
export interface PointerAdaptorProps {
    /** DOM element that should listen for pointer events. Defaults to `document.body` */
    domElement?: HTMLElement;
    /** Damping value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
    /** Whether to normalize the pointer position values. Defaults to true */
    shouldNormalize?: boolean;
    /** If values are normalized, whether they should be in -1 to 1 range. Defaults to true. */
    normalizeAroundZero?: boolean;
    /** Debounce for registering a change in the pointer count, in ms. Defaults to 100. */
    multipointerThreshold?: number;
}
/**
 * Parse pointer events to emit dampened, normalized coordinates along with the pointer count (for detecting multi-touch or drag events)
 * @remarks
 * Note: CSS property `touch-action: none` will probably be needed on listener element
 * @example Pointer adaptor
 * ```javascript
 * const pointerAdaptor = new PointerAdaptor()
 * pointerAdaptor.connect()
 * pointerAdaptor.addEventListener('update', (event) => {
 *  switch(event.pointerCount) {
 *    case 0:
 *      cube.scale.x = event.values.x
 *      cube.scale.y = event.values.y
 *      break
 *    case 1:
 *      cube.position.x += event.deltas.x
 *      cube.position.y -= event.deltas.y
 *      break
 *    default:
 *      break
 *  }
 * })
 *
 * // in RAF loop:
 * function animate(t) {
 *  pointerAdaptor.update(t)
 * }
 * ```
 */
export declare class PointerAdaptor extends BaseAdaptor {
    private damper;
    private dampingFactor;
    private connected;
    private domElement;
    private shouldNormalize;
    private normalizeAroundZero;
    private width;
    private height;
    private pointerCount;
    private recordedPosition;
    private cache;
    private lastDownTime;
    private lastUpTime;
    private multipointerThreshold;
    constructor(props: PointerAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(time: number): void;
    isEnabled(): boolean;
    private setDimensions;
    private getPointerPosition;
    private normalize;
    private onPointerMove;
    private onPointerDown;
    private onPointerUp;
    private onResize;
}
export {};
//# sourceMappingURL=PointerAdaptor.d.ts.map
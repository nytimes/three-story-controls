import { BaseAdaptor, DiscreteEvent } from './BaseAdaptor';
/**
 * Payload signature for a swipe event.
 * The sign represents the direction of the swipe,
 * y = 1 when swiping down-to-up, and x = 1 when swiping left-to-right
 * */
export interface SwipeAdaptorEvent extends DiscreteEvent {
    x: -1 | 1 | 0;
    y: -1 | 1 | 0;
}
export interface SwipeAdaptorProps {
    /** DOM element to listen to events on. Defaults to document.body */
    domElement?: HTMLElement;
    /** Threshold of pointer's deltaX to trigger events. Defaults to 60 */
    thresholdX?: number;
    /** Threshold of pointer's deltaY to trigger events. Defaults to 60 */
    thresholdY?: number;
}
/**
 * Emits events in response to swipe gestures above a given threshold.
 * @remarks
 * Note: CSS property `touch-action: none` will probably be needed on listener element
 * @example Swipe adaptor
 * ```javascript
 * const swipeAdaptor = new SwipeAdaptor()
 * swipeAdaptor.connect()
 * swipeAdaptor.addEventListener('trigger', (event) => {
 *   cube.scale.y += event.y*0.1
 * })
 * ```
 */
export declare class SwipeAdaptor extends BaseAdaptor {
    private domElement;
    private thresholdX;
    private thresholdY;
    private startX;
    private startY;
    private connected;
    constructor(props?: SwipeAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    private onPointerDown;
    private onPointerUp;
}
//# sourceMappingURL=SwipeAdaptor.d.ts.map
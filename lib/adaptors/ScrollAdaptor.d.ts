import { BaseAdaptor, ContinuousEvent } from './BaseAdaptor';
import { DamperValues } from '../Damper';
/**
 * Each property has a 0-1 value, representing the area that has scrolled into view.
 * `head` is percentage the first 100vh of the scroll div,
 * `foot` is the last 100vh, and `body` is the area in between. `total` represents
 * the percentage scrolled of the entire div.
 * */
export interface ScrollPercentages extends DamperValues {
    head: number;
    body: number;
    foot: number;
    total: number;
}
/**
 * Payload signature for a scroll event. Includes true and dampened values,
 * incase real time values are needed
 */
export interface ScrollAdaptorEvent extends ContinuousEvent {
    values: ScrollPercentages;
    dampenedValues: ScrollPercentages;
}
export interface ScrollAdaptorProps {
    /** Long DOM Element to observe */
    scrollElement: HTMLElement;
    /** Scroll element's parent, to gather scroll values from. Defaults to window */
    scrollParent?: HTMLElement;
    /** Value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
}
/**
 * Emits normalized values for the amount a given DOM element has been scrolled through.
 * @example Scroll adaptor
 * ```javascript
 * const scrollAdaptor = new WheelAdaptor({ scrollElement: document.querySelector('.scroller'), dampingFactor: 0.1 })
 * scrollAdaptor.connect()
 * scrollAdaptor.addEventListener('update', (event) => {
 *   cube.rotation.y = event.total*Math.PI*2
 * })
 * ```
 */
export declare class ScrollAdaptor extends BaseAdaptor {
    private scrollElement;
    private scrollParent;
    private observer;
    private damper;
    private dampingFactor;
    private connected;
    private isIntersecting;
    private values;
    private lastSeenScrollValue;
    constructor(props: ScrollAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    private normalize;
    private onIntersected;
}
//# sourceMappingURL=ScrollAdaptor.d.ts.map
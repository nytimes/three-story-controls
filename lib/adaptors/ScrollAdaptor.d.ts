import { BaseAdaptor, ContinuousEvent } from './BaseAdaptor';
import { DamperValues } from '../Damper';
/**
 * Event: Fired when when the 'in view' amount of the given DOM element changes
 */
export interface ScrollAdaptorEvent extends ContinuousEvent {
    values: DamperValues;
    dampenedValues: DamperValues;
}
/**
 * Properties that can be passed to the {@link @threebird/controls#ScrollAdaptor} constructor
 */
export interface ScrollAdaptorProps {
    /** Long DOM Element to observe */
    scrollElement: HTMLElement;
    /** Offset to start registering scroll, in px or vh. Default starts when top of element is at bottom of viewport. */
    startOffset?: string;
    /** Offset to end registering scroll, in px or vh. Default ends when bottom of element is at top of viewport. */
    endOffset?: string;
    /** Buffer before and after element to start registering scroll. Number between 0 and 1, defaults to 0.1 */
    buffer?: number;
    /** Value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
}
/**
 * Emits normalized values for the amount a given DOM element has been scrolled through.
 * @remarks
 * See {@link @threebird/controls#ScrollAdaptorProps} for all properties that can be passed to the constructor.
 * @example Scroll adaptor
 * ```javascript
 * const scrollAdaptor = new ScrollAdaptor({ scrollElement: document.querySelector('.scroller'), dampingFactor: 0.1 })
 * scrollAdaptor.connect()
 * scrollAdaptor.addEventListener('update', (event) => {
 *   cube.rotation.y = event.dampenedValues.scrollPercent*Math.PI*2
 * })
 * ```
 */
export declare class ScrollAdaptor extends BaseAdaptor {
    private scrollElement;
    private damper;
    private dampingFactor;
    private connected;
    private values;
    private lastSeenScrollValue;
    private previousScrollValue;
    private startPosition;
    private endPosition;
    private distance;
    private bufferedStartPosition;
    private bufferedEndPosition;
    private startOffset;
    private endOffset;
    private buffer;
    private resizeObserver;
    constructor(props: ScrollAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    parseOffset(offset: string): number;
    private calculateOffset;
    private calculateDimensions;
    private onScroll;
}
//# sourceMappingURL=ScrollAdaptor.d.ts.map
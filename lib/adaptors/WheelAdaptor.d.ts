import { BaseAdaptor, DiscreteEvent, ContinuousEvent } from './BaseAdaptor';
import { DamperValues } from '../Damper';
/**
 * Event: Fired when when discrete `wheel` events are registered
 * @remarks
 * The sign represents the the direction of the wheel event that caused the event to trigger
 * */
export interface WheelAdaptorDiscreteEvent extends DiscreteEvent {
    x: -1 | 1 | 0;
    y: -1 | 1 | 0;
}
/**
 * Event: Fired on a continuous `WheelAdaptor` in response to `wheel` events
 * @remarks
 * DamperValues have `x` and `y` keys.
 * */
export interface WheelAdaptorContinuousEvent extends ContinuousEvent {
    values: DamperValues;
    deltas: DamperValues;
}
/**
 * A discrete adaptor works as a trigger - only firing events when wheel events pass a given threshold,
 * whereas a continuous adaptor continuously fires events on wheel
 * */
export declare type WheelAdaptorType = 'discrete' | 'continuous';
/**
 * Properties that can be passed to the {@link three-story-controls#WheelAdaptor} constructor
 */
export interface WheelAdaptorProps {
    /** 'discrete' or 'continuous' */
    type: WheelAdaptorType;
    /** DOM element to listen to events on. Defaults to window */
    domElement?: HTMLElement;
    /** Only used for continuous adaptor, value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
    /** Only used for discrete adaptor, threshold of wheel.deltaX to trigger events. Defaults to 15 */
    thresholdX?: number;
    /** Only used for discrete adaptor, threshold of wheel.deltaY to trigger events. Defaults to 15 */
    thresholdY?: number;
    /** Only used for discrete adaptor, rest duration between firing trigger events. Defaults to 700 */
    debounceDuration?: number;
}
/**
 * Parse mouse wheel events and emit either dampened values, or trigger events for swipes that cross a given threshold.
 * @remarks
 * See {@link three-story-controls#WheelAdaptorProps} for all properties that can be passed to the constructor.
 * @example Discrete adaptor
 * ```javascript
 * const wheelAdaptor = new WheelAdaptor({ type: 'discrete' })
 * wheelAdaptor.connect()
 * wheelAdaptor.addEventListener('trigger', (event) => {
 *   cube.scale.y += event.y*0.1
 * })
 * ```
 */
export declare class WheelAdaptor extends BaseAdaptor {
    private type;
    private domElement;
    private dampingFactor;
    private damper;
    private thresholdX;
    private thresholdY;
    private debounceDuration;
    private lastThresholdTrigger;
    private connected;
    constructor(props: WheelAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    private onWheel;
}
//# sourceMappingURL=WheelAdaptor.d.ts.map
import { BaseAdaptor, DiscreteEvent, ContinuousEvent } from './BaseAdaptor';
import { DamperValues } from '../Damper';
/**
 * Event: Fired when a key in a `discrete` KeyboardAdaptor's mapping is released (`onKeyUp`)
 * @example
 * ```javascript
 * adaptor.on('trigger', () => {
 *   // do something
 * })
 * ```
 * */
export interface KeyboardAdaptorDiscreteEvent extends DiscreteEvent {
    /** KeyMapping key that triggered the event */
    trigger: string;
}
/**
 * Event: Fired when a key in a `continuous` KeyboardAdaptor's mapping is pressed (`onKeyDown`)
 * @example
 * ```javascript
 * adaptor.on('update', () => {
 *   // do something
 * })
 * ```
 * */
export interface KeyboardAdaptorContinuousEvent extends ContinuousEvent {
    values: DamperValues;
    deltas: DamperValues;
}
/**
 * A discrete adaptor works as a trigger - only firing events on keyup,
 * whereas a continuous adaptor continuously fires events on keydown
 * */
export declare type KeyboardAdaptorType = 'discrete' | 'continuous';
export interface KeyMapping {
    /** The key is a semantic label, and the string[] is a corresponding collection of event.keys */
    [key: string]: string[];
}
export interface KeyboardAdaptorProps {
    type: KeyboardAdaptorType;
    /**
     * Default key mapping uses up/down/left/right as semanic labels, with WASD and arrow keys mapped appropriately:
     * @example keyMapping
     * ```javascript
     * {
     *   up: ['ArrowUp', 'w', 'W'],
     *   down: ['ArrowDown', 's', 'S'],
     *   left: ['ArrowLeft', 'a', 'A'],
     *   right: ['ArrowRight', 'd', 'D'],
     * }
     * ```
     * */
    keyMapping?: KeyMapping;
    /** Only used for continuous adaptor, value between 0 and 1. Defaults to 0.5 */
    dampingFactor?: number;
    /** Only used for continuous adaptor, the amount to increment the target value on each keydown event. Defaults to 1 */
    incrementor?: number;
    /** Prevent event bubbling. Defaults to true */
    preventBubbling?: boolean;
}
/**
 * Parse keyboard events and emit either dampened values for continuous keypresses, or trigger events named according to a provided keymapping.
 * @example Continuous adaptor
 * ```javascript
 * const keyboardAdaptor = new KeyboardAdaptor({ type: 'continuous', dampingFactor: 0.2 })
 * keyboardAdaptor.connect()
 * keyboardAdaptor.addEventListener('update', (event) => {
 *   cube.rotation.y += event.deltas.right - event.deltas.left
 *   cube.rotation.x += event.deltas.up - event.deltas.down
 * )}
 * function animate() {
 *  keyboardAdaptor.update()
 *  window.requestAnimationFrame(animate)
 * }
 * animate()
 * ```
 */
export declare class KeyboardAdaptor extends BaseAdaptor {
    private type;
    private damper;
    private dampingFactor;
    private incrementor;
    private keyMapping;
    private connected;
    private preventBubbling;
    constructor(props: KeyboardAdaptorProps);
    connect(): void;
    disconnect(): void;
    update(): void;
    isEnabled(): boolean;
    private onKeyUp;
    private onKeyDown;
}
//# sourceMappingURL=KeyboardAdaptor.d.ts.map
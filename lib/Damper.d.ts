export interface DamperValues {
    /** A value to dampen, set to its initial state  */
    [key: string]: number | null;
}
export interface DamperProps {
    /**  Values to be dampened */
    values: DamperValues;
    /** Multiplier used on each update to approach the target value, should be between 0 and 1, where 1 is no damping */
    dampingFactor: number;
    /** Amount of permitted error before a value is considered to have 'reached' its target. Defaults to 0.001 */
    epsilon?: number;
}
/**
 * Damper uses simple linear damping for a given collection of values.
 * On every call to update, the damper will approach a given set of target values.
 * @example
 * ```js
 * const damper = new Damper({
 *  values: {x: 0, y: 0},
 *  dampingFactor: 0.4
 * })
 *
 * damper.setTarget({ x: 1, y: 100 })
 * damper.update() // would generally be called in an animation loop
 * const values = damper.getCurrentValues() // values.x = 0.4; values.y = 40
 * ```
 */
export declare class Damper {
    private dampingFactor;
    private epsilon;
    private values;
    private targetValues;
    private deltaValues;
    private hasReached;
    constructor(props: DamperProps);
    /**
     * Update the damper, should generally be called on every frame
     */
    update(): void;
    /**
     * @param target DamperValues the damper needs to approach
     */
    setTarget(target: DamperValues): void;
    /**
     * Increment/Decrement a specifc damper target value
     * @param key The key of the value to modify
     * @param value The amount to modify the target by
     */
    addToTarget(key: string, value: number): void;
    /**
     * @param value Number to reset all damper values to
     */
    resetAll(value: number): void;
    /**
     * Reset damper values as described by the given DamperValues object
     * @param values DamperValues object to reset the damper to
     */
    resetData(values: DamperValues): void;
    /**
     * @returns DamperValues object with the current values of the damper
     */
    getCurrentValues(): DamperValues;
    /**
     * @returns DamperValues object with the amount the values changed since the last `update()` call
     */
    getDeltaValues(): DamperValues;
    /**
     * @returns Whether the damper has reached its target (within permissible error range)
     */
    reachedTarget(): boolean;
}
//# sourceMappingURL=Damper.d.ts.map
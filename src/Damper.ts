export interface DamperValues {
  /** A value to dampen, set to its initial state  */
  [key: string]: number | null
}

export interface DamperProps {
  /**  Values to be dampened */
  values: DamperValues
  /** Multiplier used on each update to approach the target value, should be between 0 and 1, where 1 is no damping */
  dampingFactor: number
  /** Amount of permitted error before a value is considered to have 'reached' its target. Defaults to 0.001 */
  epsilon?: number
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

export class Damper {
  private dampingFactor: number
  private epsilon = 0.001
  private values: DamperValues = {}
  private targetValues: DamperValues = {}
  private deltaValues: DamperValues = {}
  private hasReached: boolean

  constructor(props: DamperProps) {
    Object.assign(this.values, props.values)
    Object.assign(this.targetValues, props.values)
    this.deltaValues = {}
    for (const key in this.values) {
      this.deltaValues[key] = 0
    }
    this.dampingFactor = props.dampingFactor
    if (props.epsilon) this.epsilon = props.epsilon
    this.hasReached = true
  }

  /**
   * Update the damper, should generally be called on every frame
   */
  update(): void {
    const deltas = {}
    let approached = true

    for (const key in this.values) {
      deltas[key] = this.targetValues[key] - this.values[key]
      approached = approached && Math.abs(deltas[key]) < this.epsilon
    }

    if (approached) {
      for (const key in this.values) {
        this.deltaValues[key] = deltas[key]
        this.values[key] = this.targetValues[key]
      }
      this.hasReached = true
    } else {
      for (const key in this.values) {
        this.deltaValues[key] = this.dampingFactor * deltas[key]
        this.values[key] += this.deltaValues[key]
      }
    }
  }

  /**
   * Set the target values the damper needs to approach
   * @param target DamperValues the damper needs to approach
   */
  setTarget(target: DamperValues): void {
    for (const key in target) {
      this.targetValues[key] = target[key]
    }
    this.hasReached = false
  }

  /**
   * Increment/Decrement a specifc damper target value
   * @param key The key of the value to modify
   * @param value The amount to modify the target by
   */
  addToTarget(key: string, value: number): void {
    this.targetValues[key] += value
    this.hasReached = false
  }

  /**
   * Reset all damper values to the fiven number
   * @param value Number to reset all damper values to
   */
  resetAll(value: number): void {
    for (const key in this.values) {
      this.targetValues[key] = value
      this.values[key] = value
      this.deltaValues[key] = 0
    }
    this.hasReached = true
  }

  /**
   * Reset damper values as described by the given DamperValues object
   * @param values DamperValues object to reset the damper to
   */
  resetData(values: DamperValues): void {
    for (const key in values) {
      this.targetValues[key] = values[key]
      this.values[key] = values[key]
      this.deltaValues[key] = 0
    }
    this.hasReached = true
  }

  /**
   * Get the current values
   * @returns DamperValues object with the current values of the damper
   */
  getCurrentValues(): DamperValues {
    return { ...this.values }
  }

  /**
   * Get the change in values since the last update call
   * @returns DamperValues object with the amount the values changed since the last `update()` call
   */
  getDeltaValues(): DamperValues {
    return { ...this.deltaValues }
  }

  /**
   * Whether the damper has reached its target
   * @returns Whether the damper has reached its target (within permissible error range)
   */
  reachedTarget(): boolean {
    return this.hasReached
  }
}

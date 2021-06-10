import { BaseAdaptor, DiscreteEvent, ContinuousEvent, IntertiaCompleteEvent } from './BaseAdaptor'
import { Damper, DamperValues } from '../Damper'

/**
 * Payload signature for a discrete wheel event.
 * The sign represents the direction of the wheel event that caused the event to trigger
 * */
export interface WheelAdaptorDiscreteEvent extends DiscreteEvent {
  x: -1 | 1 | 0
  y: -1 | 1 | 0
}

/**
 * Payload signature for a continuous wheel event.
 * DamperValues have `x` and `y` keys.
 */
export interface WheelAdaptorContinuousEvent extends ContinuousEvent {
  values: DamperValues
  deltas: DamperValues
}

/**
 * A discrete adaptor works as a trigger - only firing events when wheel events pass a given threshold,
 * whereas a continuous adaptor continuously fires events on wheel
 * */
export type WheelAdaptorType = 'discrete' | 'continuous'

export interface WheelAdaptorProps {
  type: WheelAdaptorType
  /** DOM element to listen to events on. Defaults to window */
  domElement?: HTMLElement
  /** Only used for continuous adaptor, value between 0 and 1. Defaults to 0.5 */
  dampingFactor?: number
  /** Only used for discrete adaptor, threshold of wheel.deltaX to trigger events. Defaults to 15 */
  thresholdX?: number
  /** Only used for discrete adaptor, threshold of wheel.deltaY to trigger events. Defaults to 15 */
  thresholdY?: number
  /** Only used for discrete adaptor, rest duration between firing trigger events. Defaults to 700 */
  debounceDuration?: number
}

/**
 * Parse mouse wheel events and emit either dampened values, or trigger events for swipes that cross a given threshold.
 * @example Discrete adaptor
 * ```javascript
 * const wheelAdaptor = new WheelAdaptor({ type: 'discrete' })
 * wheelAdaptor.connect()
 * wheelAdaptor.addEventListener('trigger', (event) => {
 *   cube.scale.y += event.y*0.1
 * })
 * ```
 */
export class WheelAdaptor extends BaseAdaptor {
  private type: WheelAdaptorType
  private domElement: HTMLElement
  private dampingFactor = 0.5
  private damper: Damper
  private thresholdX = 15
  private thresholdY = 15
  private debounceDuration = 700
  private lastThresholdTrigger = 0
  private connected: boolean

  constructor(props: WheelAdaptorProps) {
    super()
    Object.assign(this, props)
    this.damper = new Damper({
      values: { x: 0, y: 0 },
      dampingFactor: this.dampingFactor,
    })
    this.onWheel = this.onWheel.bind(this)
  }

  connect(): void {
    const element = this.domElement || window
    element.addEventListener('wheel', this.onWheel, { passive: true })
    this.connected = true
  }

  disconnect(): void {
    const element = this.domElement || window
    element.removeEventListener('wheel', this.onWheel)
    this.connected = false
  }

  update(): void {
    if (this.type === 'continuous' && !this.damper.reachedTarget()) {
      this.damper.update()
      this.dispatchEvent({
        type: 'update',
        values: this.damper.getCurrentValues(),
        deltas: this.damper.getDeltaValues(),
      } as WheelAdaptorContinuousEvent)
      if (this.damper.reachedTarget()) {
        this.damper.resetAll(0)
        this.dispatchEvent({
          type: 'inertiacomplete',
        } as IntertiaCompleteEvent)
      }
    }
  }

  isEnabled(): boolean {
    return this.connected
  }

  private onWheel(event: WheelEvent): void {
    if (this.type === 'continuous') {
      this.damper.addToTarget('x', event.deltaX)
      this.damper.addToTarget('y', event.deltaY)
    } else if (this.type === 'discrete') {
      if (Math.abs(event.deltaX) >= this.thresholdX || Math.abs(event.deltaY) >= this.thresholdY) {
        const now = window.performance.now()
        if (now - this.lastThresholdTrigger > this.debounceDuration) {
          this.lastThresholdTrigger = now
          this.dispatchEvent({
            type: 'trigger',
            x: Math.abs(event.deltaX) >= this.thresholdX ? Math.sign(event.deltaX) : 0,
            y: Math.abs(event.deltaY) >= this.thresholdY ? Math.sign(event.deltaY) : 0,
          } as WheelAdaptorDiscreteEvent)
        }
      }
    }
  }
}

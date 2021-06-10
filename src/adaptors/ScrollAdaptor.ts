import { BaseAdaptor, ContinuousEvent, IntertiaCompleteEvent } from './BaseAdaptor'
import { Damper, DamperValues } from '../Damper'

/**
 * Each property has a 0-1 value, representing the area that has scrolled into view.
 * `head` is percentage the first 100vh of the scroll div,
 * `foot` is the last 100vh, and `body` is the area in between. `total` represents
 * the percentage scrolled of the entire div.
 * */
export interface ScrollPercentages extends DamperValues {
  head: number
  body: number
  foot: number
  total: number
}

/**
 * Payload signature for a scroll event. Includes true and dampened values,
 * incase real time values are needed
 */
export interface ScrollAdaptorEvent extends ContinuousEvent {
  values: ScrollPercentages
  dampenedValues: ScrollPercentages
}

export interface ScrollAdaptorProps {
  /** Long DOM Element to observe */
  scrollElement: HTMLElement
  /** Scroll element's parent, to gather scroll values from. Defaults to window */
  scrollParent?: HTMLElement
  /** Value between 0 and 1. Defaults to 0.5 */
  dampingFactor?: number
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
export class ScrollAdaptor extends BaseAdaptor {
  private scrollElement: HTMLElement
  private scrollParent: HTMLElement
  private observer: IntersectionObserver
  private damper: Damper
  private dampingFactor = 0.5
  private connected: boolean
  private isIntersecting = false
  private values: ScrollPercentages
  private lastSeenScrollValue: number

  constructor(props: ScrollAdaptorProps) {
    super()
    Object.assign(this, props)
    this.values = {
      head: 0,
      body: 0,
      foot: 0,
      total: 0,
    }
    this.lastSeenScrollValue = 0
    this.damper = new Damper({
      values: this.values,
      dampingFactor: this.dampingFactor,
    })
    this.onIntersected = this.onIntersected.bind(this)
    this.observer = new IntersectionObserver(this.onIntersected)
  }

  connect(): void {
    this.observer.observe(this.scrollElement)
    this.connected = true
  }

  disconnect(): void {
    this.observer.unobserve(this.scrollElement)
    this.connected = false
  }

  //TODO set this to work for any arbitary parent div
  update(): void {
    if (
      this.isIntersecting &&
      this.lastSeenScrollValue !== (this.scrollParent ? this.scrollParent.scrollTop : window.scrollY)
    ) {
      this.lastSeenScrollValue = this.scrollParent ? this.scrollParent.scrollTop : window.scrollY
      const bounds = this.scrollElement.getBoundingClientRect()
      this.values.head = this.normalize(bounds.top, window.innerHeight, 0)
      this.values.foot = this.normalize(bounds.bottom, window.innerHeight, 0)
      this.values.body = this.normalize(bounds.top, 0, window.innerHeight - bounds.height)
      this.values.total = this.normalize(bounds.top, window.innerHeight, -bounds.height)
      this.damper.setTarget(this.values)
    }
    if (!this.damper.reachedTarget()) {
      this.damper.update()
      this.dispatchEvent({
        type: 'update',
        dampenedValues: this.damper.getCurrentValues(),
        values: this.values,
      } as ScrollAdaptorEvent)
      if (this.damper.reachedTarget()) {
        this.dispatchEvent({ type: 'inertiacomplete' } as IntertiaCompleteEvent)
      }
    }
  }

  isEnabled(): boolean {
    return this.connected
  }

  private normalize(value: number, start: number, end: number): number {
    const mapped = (value - start) / (end - start)
    return Math.max(0, Math.min(1, mapped))
  }

  private onIntersected(entries: IntersectionObserverEntry[]): void {
    const entry = entries[0] // only 1 element to observe
    this.isIntersecting = entry.isIntersecting
  }
}

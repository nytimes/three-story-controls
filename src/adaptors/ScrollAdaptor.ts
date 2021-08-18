import { BaseAdaptor, ContinuousEvent, IntertiaCompleteEvent } from './BaseAdaptor'
import { Damper, DamperValues } from '../Damper'

/**
 * Event: Fired when when the 'in view' amount of the given DOM element changes
 */
export interface ScrollAdaptorEvent extends ContinuousEvent {
  values: DamperValues
  dampenedValues: DamperValues
}

/**
 * Properties that can be passed to the {@link three-story-controls#ScrollAdaptor} constructor
 */
export interface ScrollAdaptorProps {
  /** Long DOM Element to observe */
  scrollElement: HTMLElement
  /** Offset to start registering scroll, in px or vh. Default starts when top of element is at bottom of viewport. */
  startOffset?: string
  /** Offset to end registering scroll, in px or vh. Default ends when bottom of element is at top of viewport. */
  endOffset?: string
  /** Buffer before and after element to start registering scroll. Number between 0 and 1, defaults to 0.1 */
  buffer?: number
  /** Value between 0 and 1. Defaults to 0.5 */
  dampingFactor?: number
}

const defaultProps: Partial<ScrollAdaptorProps> = {
  startOffset: '0px',
  endOffset: '0px',
  buffer: 0.1,
  dampingFactor: 0.5,
}

/**
 * Emits normalized values for the amount a given DOM element has been scrolled through.
 * @remarks
 * See {@link three-story-controls#ScrollAdaptorProps} for all properties that can be passed to the constructor.
 * See {@link three-story-controls#ScrollAdaptorEvent} for emitted event signatures.
 * @example Scroll adaptor
 * ```javascript
 * const scrollAdaptor = new ScrollAdaptor({ scrollElement: document.querySelector('.scroller'), dampingFactor: 0.1 })
 * scrollAdaptor.connect()
 * scrollAdaptor.addEventListener('update', (event) => {
 *   cube.rotation.y = event.dampenedValues.scrollPercent*Math.PI*2
 * })
 * ```
 */
export class ScrollAdaptor extends BaseAdaptor {
  private scrollElement: HTMLElement
  private damper: Damper
  private dampingFactor: number
  private connected: boolean
  private values: DamperValues
  private lastSeenScrollValue: number
  private previousScrollValue: number
  private startPosition: number
  private endPosition: number
  private distance: number
  private bufferedStartPosition: number
  private bufferedEndPosition: number
  private startOffset: string
  private endOffset: string
  private buffer: number
  private resizeObserver: ResizeObserver

  constructor(props: ScrollAdaptorProps) {
    super()
    Object.assign(this, defaultProps, props)
    this.lastSeenScrollValue = window.scrollY || -1
    this.previousScrollValue = this.lastSeenScrollValue
    this.values = {
      scrollPx: null,
      scrollPercent: null,
    }
    this.damper = new Damper({
      values: this.values,
      dampingFactor: this.dampingFactor,
    })
    this.calculateDimensions = this.calculateDimensions.bind(this)
    this.onScroll = this.onScroll.bind(this)
    this.resizeObserver = new ResizeObserver(this.calculateDimensions)
    this.calculateDimensions()
  }

  connect(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.resizeObserver.observe(document.body)
    this.connected = true
  }

  disconnect(): void {
    window.removeEventListener('scroll', this.onScroll)
    this.resizeObserver.unobserve(document.body)
    this.connected = false
  }

  update(): void {
    if (
      this.lastSeenScrollValue !== this.previousScrollValue &&
      this.lastSeenScrollValue >= this.bufferedStartPosition &&
      this.lastSeenScrollValue <= this.bufferedEndPosition
    ) {
      const scrollPx = Math.max(0, Math.min(this.distance, this.lastSeenScrollValue - this.startPosition))
      const scrollPercent = Math.max(0, Math.min(1, scrollPx / this.distance))
      this.values = {
        scrollPx,
        scrollPercent,
      }
      this.damper.setTarget(this.values)
      this.previousScrollValue = this.lastSeenScrollValue
    }
    if (!this.damper.reachedTarget()) {
      this.damper.update()
      this.dispatchEvent({
        type: 'update',
        values: this.values,
        dampenedValues: this.damper.getCurrentValues(),
      } as ScrollAdaptorEvent)
      if (this.damper.reachedTarget()) {
        this.dispatchEvent({ type: 'inertiacomplete' } as IntertiaCompleteEvent)
      }
    }
  }

  isEnabled(): boolean {
    return this.connected
  }

  parseOffset(offset: string): number {
    let amount = 0
    if (offset) {
      amount = parseInt(offset)
      if (offset.indexOf('vh') !== -1) {
        amount = (amount * window.innerHeight) / 100
      } else if (this.distance && offset.indexOf('%') !== -1) {
        amount = (amount * this.distance) / 100
      }
    }
    return amount
  }

  private calculateOffset(element: HTMLElement): number {
    if (!element) return 0
    return this.calculateOffset(element.offsetParent as HTMLElement) + element.offsetTop
  }

  private calculateDimensions(): void {
    const elementHeight = this.scrollElement.clientHeight
    const offsetTop = this.calculateOffset(this.scrollElement)
    this.startPosition = offsetTop - window.innerHeight + this.parseOffset(this.startOffset)
    this.endPosition = offsetTop + elementHeight + this.parseOffset(this.endOffset)
    this.distance = this.endPosition - this.startPosition
    this.bufferedStartPosition = Math.max(0, this.startPosition * (1 - this.buffer))
    this.bufferedEndPosition = Math.min(
      this.endPosition * (1 + this.buffer),
      document.body.getBoundingClientRect().height,
    )
  }

  private onScroll(): void {
    this.lastSeenScrollValue = window.scrollY
  }
}

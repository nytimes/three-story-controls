import { BaseAdaptor, DiscreteEvent } from './BaseAdaptor'

/**
 * Event: Fired when when swipe are registered
 * @remarks
 * The sign represents the direction of the swipe,
 * y = 1 when swiping down-to-up, and x = 1 when swiping left-to-right
 * */
export interface SwipeAdaptorEvent extends DiscreteEvent {
  x: -1 | 1 | 0
  y: -1 | 1 | 0
}

/**
 * Properties that can be passed to the {@link three-story-controls#SwipeAdaptor} constructor
 */
export interface SwipeAdaptorProps {
  /** DOM element to listen to events on. Defaults to document.body */
  domElement?: HTMLElement
  /** Threshold of pointer's deltaX to trigger events. Defaults to 60 */
  thresholdX?: number
  /** Threshold of pointer's deltaY to trigger events. Defaults to 60 */
  thresholdY?: number
}

const defaultProps: SwipeAdaptorProps = {
  domElement: document.body,
  thresholdX: 60,
  thresholdY: 60,
}

/**
 * Emits events in response to swipe gestures above a given threshold.
 * @remarks
 * See {@link three-story-controls#SwipeAdaptorProps} for all properties that can be passed to the constructor.
 * See {@link three-story-controls#SwipeAdaptorEvent} for emitted event signatures.
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
export class SwipeAdaptor extends BaseAdaptor {
  private domElement: HTMLElement
  private thresholdX: number
  private thresholdY: number
  private startX: number
  private startY: number
  private connected: boolean

  constructor(props: SwipeAdaptorProps = {}) {
    super()
    Object.assign(this, defaultProps, props)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onPointerDown = this.onPointerDown.bind(this)
  }

  connect(): void {
    this.domElement.addEventListener('pointerdown', this.onPointerDown, { passive: true })
    this.domElement.addEventListener('pointerup', this.onPointerUp, { passive: true })
    this.connected = true
  }

  disconnect(): void {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointerup', this.onPointerUp)
    this.connected = false
  }

  update(): void {
    // nothing to do here
  }

  isEnabled(): boolean {
    return this.connected
  }

  private onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' && event.isPrimary) {
      this.startX = event.screenX
      this.startY = event.screenY
    }
  }

  private onPointerUp(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' && event.isPrimary) {
      const diffX = event.screenX - this.startX
      const diffY = event.screenY - this.startY
      if (Math.abs(diffX) >= this.thresholdX || Math.abs(diffY) >= this.thresholdY) {
        this.dispatchEvent({
          type: 'trigger',
          x: Math.abs(diffX) >= this.thresholdX ? Math.sign(diffX) : 0,
          y: Math.abs(diffY) >= this.thresholdY ? Math.sign(-1 * diffY) : 0,
        } as SwipeAdaptorEvent)
      }
    }
  }
}

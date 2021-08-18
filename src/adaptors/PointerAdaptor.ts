import { BaseAdaptor, ContinuousEvent, IntertiaCompleteEvent } from './BaseAdaptor'
import { Damper, DamperValues } from '../Damper'

interface Coordinates extends DamperValues {
  x: number
  y: number
}

/**
 * Event: Fired when when `PointerEvent`s are triggered
 * @example
 * ```javascript
 * adaptor.on('trigger', (e) => {
 *   console.log('x/y coordinates', e.values.x, e.values.y)
 * })
 * ```
 * */
export interface PointerAdaptorEvent extends ContinuousEvent {
  /** Dampened x and y pointer coordinates */
  values: Coordinates
  /** Pointer coordinate change since previous update */
  deltas: Coordinates
  /** Number of pointers registered */
  pointerCount: number
}

/**
 * Properties that can be passed to the {@link three-story-controls#PointerAdaptor} constructor
 */
export interface PointerAdaptorProps {
  /** DOM element that should listen for pointer events. Defaults to `document.body` */
  domElement?: HTMLElement
  /** Damping value between 0 and 1. Defaults to 0.5 */
  dampingFactor?: number
  /** Whether to normalize the pointer position values. Defaults to true */
  shouldNormalize?: boolean
  /** If values are normalized, whether they should be in -1 to 1 range. Defaults to true. */
  normalizeAroundZero?: boolean
  /** Debounce for registering a change in the pointer count, in ms. Defaults to 100. */
  multipointerThreshold?: number
}

const defaultProps: PointerAdaptorProps = {
  domElement: document.body,
  dampingFactor: 0.5,
  shouldNormalize: true,
  normalizeAroundZero: true,
  multipointerThreshold: 100,
}

/**
 * Parse pointer events to emit dampened, normalized coordinates along with the pointer count (for detecting multi-touch or drag events)
 * @remarks
 * See {@link three-story-controls#PointerAdaptorProps} for all properties that can be passed to the constructor.
 * See {@link three-story-controls#PointerAdaptorEvent} for emitted event signatures.
 * Note: CSS property `touch-action: none` will probably be needed on listener element.
 * @example Pointer adaptor
 * ```javascript
 * const pointerAdaptor = new PointerAdaptor()
 * pointerAdaptor.connect()
 * pointerAdaptor.addEventListener('update', (event) => {
 *  switch(event.pointerCount) {
 *    case 0:
 *      cube.scale.x = event.values.x
 *      cube.scale.y = event.values.y
 *      break
 *    case 1:
 *      cube.position.x += event.deltas.x
 *      cube.position.y -= event.deltas.y
 *      break
 *    default:
 *      break
 *  }
 * })
 *
 * // in RAF loop:
 * function animate(t) {
 *  pointerAdaptor.update(t)
 * }
 * ```
 */
export class PointerAdaptor extends BaseAdaptor {
  private domElement = document.body
  private dampingFactor: number
  private shouldNormalize = true
  private normalizeAroundZero = true
  private multipointerThreshold: number
  private damper: Damper
  private connected: boolean
  private width: number
  private height: number
  private pointerCount = 0
  private recordedPosition = false
  private cache: Array<PointerEvent> = []
  private lastDownTime = 0
  private lastUpTime = 0

  constructor(props: PointerAdaptorProps) {
    super()
    Object.assign(this, defaultProps, props)
    this.damper = new Damper({
      values: { x: null, y: null },
      dampingFactor: this.dampingFactor,
    })
    this.setDimensions()
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onResize = this.onResize.bind(this)
  }

  connect(): void {
    this.domElement.addEventListener('pointermove', this.onPointerMove, { passive: true })
    this.domElement.addEventListener('pointerdown', this.onPointerDown, { passive: true })
    this.domElement.addEventListener('pointerleave', this.onPointerUp, { passive: true })
    this.domElement.addEventListener('pointerup', this.onPointerUp, { passive: true })
    window.addEventListener('resize', this.onResize)
    this.connected = true
  }

  disconnect(): void {
    this.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointerleave', this.onPointerUp)
    this.domElement.removeEventListener('pointerup', this.onPointerUp)
    this.connected = false
  }

  update(time: number): void {
    if (
      this.pointerCount !== this.cache.length &&
      time - this.lastDownTime > this.multipointerThreshold &&
      time - this.lastUpTime > this.multipointerThreshold
    ) {
      this.pointerCount = this.cache.length
      if (this.pointerCount === 0) {
        this.damper.resetAll(null)
        this.recordedPosition = false
      } else {
        this.damper.resetData(this.getPointerPosition(this.cache[0]))
        this.recordedPosition = true
      }
    }

    if (!this.damper.reachedTarget()) {
      this.damper.update()
      this.dispatchEvent({
        type: 'update',
        values: this.shouldNormalize
          ? this.normalize(this.damper.getCurrentValues() as Coordinates, this.normalizeAroundZero)
          : this.damper.getCurrentValues(),
        deltas: this.shouldNormalize
          ? this.normalize(this.damper.getDeltaValues() as Coordinates, false)
          : this.damper.getDeltaValues(),
        pointerCount: this.pointerCount,
      } as PointerAdaptorEvent)
      if (this.damper.reachedTarget()) {
        this.dispatchEvent({ type: 'inertiacomplete' } as IntertiaCompleteEvent)
      }
    }
  }

  isEnabled(): boolean {
    return this.connected
  }

  private setDimensions(): void {
    this.width = this.domElement.getBoundingClientRect().width
    this.height = this.domElement.getBoundingClientRect().height
  }

  private getPointerPosition(event: PointerEvent): Coordinates {
    // event.offsetLeft is still experimental
    return {
      x: Math.max(0, Math.min(this.width, event.x - this.domElement.offsetLeft)),
      y: Math.max(0, Math.min(this.height, event.y - this.domElement.offsetTop)),
    }
  }

  private normalize(values: Coordinates, aroundZero: boolean): Coordinates {
    let x = values.x / this.width
    let y = values.y / this.height
    if (aroundZero) {
      x = x * 2 - 1
      y = y * 2 - 1
    }
    return { x, y }
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.pointerCount === this.cache.length) {
      if (this.cache.length === 0) {
        if (!this.recordedPosition) {
          this.damper.resetData(this.getPointerPosition(event))
          this.recordedPosition = true
        } else {
          this.damper.setTarget(this.getPointerPosition(event))
        }
      } else {
        if (event.pointerId === this.cache[0].pointerId) {
          this.damper.setTarget(this.getPointerPosition(event))
        }
      }
    }
  }

  private onPointerDown(event: PointerEvent): void {
    // only deals with left mouse button right now
    // TODO: add some logic for optional right button events
    if (event.button === 0) {
      this.cache.push(event)
      this.lastDownTime = window.performance.now()
    }
  }

  private onPointerUp(event: PointerEvent): void {
    if (event.button === 0 || event.type === 'pointerleave') {
      for (let i = 0; i < this.cache.length; i++) {
        if (this.cache[i].pointerId == event.pointerId) {
          this.cache.splice(i, 1)
          break
        }
      }
      this.lastUpTime = window.performance.now()
    }
  }

  private onResize(): void {
    this.setDimensions()
  }
}

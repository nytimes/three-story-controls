import { EventDispatcher } from 'three'

export abstract class BaseAdaptor extends EventDispatcher {
  constructor() {
    super()
  }
  abstract connect(): void
  abstract disconnect(): void
  abstract update(time?: number): void
  abstract isEnabled(): boolean
}

export interface DiscreteEvent {
  type: 'trigger'
}

export interface ContinuousEvent {
  type: 'update'
}

export interface IntertiaCompleteEvent {
  type: 'inertiacomplete'
}

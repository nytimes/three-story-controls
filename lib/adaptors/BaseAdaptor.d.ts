import { EventDispatcher } from 'three';
export declare abstract class BaseAdaptor extends EventDispatcher {
    constructor();
    abstract connect(): void;
    abstract disconnect(): void;
    abstract update(time?: number): void;
    abstract isEnabled(): boolean;
}
export interface DiscreteEvent {
    type: 'trigger';
}
export interface ContinuousEvent {
    type: 'update';
}
export interface IntertiaCompleteEvent {
    type: 'inertiacomplete';
}
//# sourceMappingURL=BaseAdaptor.d.ts.map
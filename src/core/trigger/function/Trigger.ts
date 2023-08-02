import { EventEmitter } from 'events';

export class Trigger<T extends string> extends EventEmitter {
    on(event: T, listener: () => void) {
        return super.on(event, listener);
    }

    once(event: T, listener: () => void) {
        return super.once(event, listener);
    }
}
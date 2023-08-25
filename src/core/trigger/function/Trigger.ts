import { EventEmitter } from 'events';

export class Trigger<T extends string> extends EventEmitter {
    on(event: T, listener: (...args) => void) {
        return super.on(event, listener);
    }

    once(event: T, listener: (...args) => void) {
        return super.once(event, listener);
    }

    emit(event: T, ...args) {
        return super.emit(event, ...args);
    }
}
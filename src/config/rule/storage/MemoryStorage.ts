import { EStorage } from "../../../core/trigger/event/EStorage";
import { Trigger } from "../../../core/trigger/function/Trigger";

export class MemoryStorage extends Trigger<EStorage> {
    store: Map<string, number> = new Map();

    private interval: number;
    private timer: NodeJS.Timer;

    restore() {
        this.store = new Map();
    }

    constructor(interval: number) {
        super();

        this.interval = interval;

        this.on('update', interval => {
            this.interval = interval;
            this.restart();
        })
    }

    start() {
        this.timer = setInterval(() => {
            this.restore();
        }, this.interval);
    }

    restart() {
        clearInterval(this.timer as any);
        this.restore();

        return this.start();
    }

    incr(key: string) {
        const count = (this.store.get(key) || 0) + 1;
        this.store.set(key, count);

        return count;
    }
}
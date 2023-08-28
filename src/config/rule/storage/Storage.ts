import { EStorage } from "../../../core/trigger/event/EStorage";
import { Trigger } from "../../../core/trigger/function/Trigger";
import { TStorage } from "../type/TStorage";
import { MemoryStorage } from "./MemoryStorage";
import { RedisStorage } from "./RedisStorage";

export class Storage extends Trigger<EStorage> {
    store: MemoryStorage | RedisStorage;

    constructor(options: {
        interval: number;
        storage?: TStorage;
    }) {
        super();

        const { storage = 'memory', interval } = options;

        if (storage === 'memory') {
            this.store = new MemoryStorage(interval);
        } else {
            this.store = new RedisStorage({ redis: storage, ttl: interval });
        }

        this.on('update', opts => this.store.emit('update', opts));
    }

    async incr(key: string) {
        return this.store.incr(key);
    }

    start() {
        return this.store.start();
    }
}
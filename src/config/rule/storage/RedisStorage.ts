import * as Redis from 'ioredis';
import { Trigger } from '../../../core/trigger/function/Trigger';
import { EStorage } from '../../../core/trigger/event/EStorage';

type Options = {
    ttl: number;
    redis: Redis.RedisOptions;
}

export class RedisStorage extends Trigger<EStorage> {
    store: Redis.Redis;

    private ttl = 0;

    constructor(options: Options) {
        super();

        this.restore(options);

        this.on('update', (opts: Options) => this.restore(opts));
    }

    restore(options: Options) {
        const { ttl, redis } = options;

        this.ttl = ~~ttl || this.ttl;

        const store = this.store;
        this.store = new Redis.Redis(redis);

        if(store)
            store.disconnect();
    }

    start() {}

    private realKey(key: string) {
        return `valve:ip-count:${key}`;
    }

    async incr(key: string) {
        key = this.realKey(key);
        const c = await this.store.incr(key);
        if(c === 1)
            this.setTTL(key);
        return c;
    }

    private setTTL(key) {
        process.nextTick(async () => {
            const ttl = await this.store.ttl(key);

            if(ttl < 0)
                await this.store.pexpire(key, this.ttl);
        });
    }
}
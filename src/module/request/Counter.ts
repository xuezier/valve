import { Module } from "../base/Module";

export class RequestCounter extends Module {
    private _interval = 60 * 1000;

    get interval() {
        return this._interval;
    }

    private _lastReset = Date.now();

    get lastReset() {
        return this._lastReset;
    }

    private set lastReset(lastReset: number) {
        this._lastReset = lastReset;
    }

    private _count = 0;

    get count() {
        return this._count;
    }

    private set count(count: number) {
        this._count = count;
    }

    constructor(interval?: number) {
        super();

        if(interval)
            this._interval = interval * 1000;
    }

    addRequest() {
        const now = Date.now();
        if(now - this.lastReset > this.interval) {
            this.count = 0;
            this.lastReset = now;
        }

        this.count++;
    }
}
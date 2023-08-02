import { Module } from "../base/Module";

// RequestCounter类用于计算请求的频率和次数
export class RequestCounter extends Module {
    // 默认的时间窗口为60秒
    private _interval = 60 * 1000;

    // 获取时间窗口
    get interval() {
        return this._interval;
    }

    // 设置时间窗口
    private set interval(interval) {
        this._interval = interval;
    }

    // 上次计数重置的时间戳
    private _lastReset = Date.now();

    // 获取上次计数重置的时间戳
    get lastReset() {
        return this._lastReset;
    }

    // 设置上次计数重置的时间戳
    private set lastReset(lastReset: number) {
        this._lastReset = lastReset;
    }

    // 请求计数器
    private _count = 0;

    // 获取请求计数器
    get count() {
        return this._count;
    }

    // 设置请求计数器
    private set count(count: number) {
        this._count = count;
    }

    // 构造函数，接受一个可选的时间窗口参数，单位为秒
    constructor(interval?: number) {
        super();

        // 如果传入了时间窗口参数，则将时间间隔转换为毫秒并赋值给_interval
        if(interval)
            this.interval = interval * 1000;
    }

    // addRequest方法用于增加请求计数
    addRequest() {
        // 获取当前时间戳
        const now = Date.now();

        // 如果当前时间与上次计数重置的时间间隔超过了设定的时间窗口，则将计数器重置为0，并更新上次计数重置的时间戳
        if(now - this.lastReset > this.interval) {
            this.count = 0;
            this.lastReset = now;
        }

        // 计数器加1
        this.count++;
    }
}

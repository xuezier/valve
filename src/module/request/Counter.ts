import { Valve } from "../../Valve";
import { APILayer } from "../../core/server/APILayer";
import { ECounter } from "../../core/trigger/event/ECounter";
import { Trigger } from "../../core/trigger/function/Trigger";
import { Module } from "../base/Module";

// RequestCounter类用于计算请求的频率和次数
export class RequestCounter extends Module {
    // 获取时间窗口
    get interval() {
        return this.valve.config.interval;
    }

    // 上次计数重置的时间戳
    private _lastReset = Date.now();

    // 获取上次计数重置的时间戳
    get lastReset() {
        return this._lastReset;
    }

    private _parent: RequestCounter;
    get parent() {
        return this._parent;
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

    // 触发器实例，用于触发事件
    private _trigger = new Trigger<ECounter>();

    // 获取触发器实例
    get trigger() {
        return this._trigger;
    }

    // 存储API请求计数器的Map，键为APILayer对象，值为对应的RequestCounter实例
    private _APICounter: Map<APILayer, RequestCounter> = new Map();
    get APICounter() {
        return this._APICounter;
    }

    get logger() {
        return this.valve.logger;
    }

    constructor(valve: Valve, parent?: RequestCounter) {
        super(valve);

        if(parent) {
            this._parent = parent;
            this.lastReset = this.parent.lastReset;
        }

        // 注册触发器的'reset'事件，当触发该事件时执行reset方法
        this.trigger.on('reset', () => this.reset());
    }

    /**
     * 增加请求计数
     * @returns 返回增加后的请求计数值
     */
    addRequest() {
        // 获取当前时间戳
        const now = Date.now();

        // 如果当前时间与上次计数重置的时间间隔超过了设定的时间窗口，则将计数器重置为0，并更新上次计数重置的时间戳
        if (now - this.lastReset > this.interval)
            this.reset();

        // 计数器加1
        this.count++;

        return this.count;
    }

    estimateCount() {
        // 获取当前时间戳
        const now = Date.now();

        return ~~(this.count * this.interval / (now - this.lastReset));
    }

    getAPICounter(api?: APILayer) {
        if(!api)
            return;

        if(!this.APICounter.has(api))
            this.APICounter.set(api, new RequestCounter(this.valve));

        return (<RequestCounter>this.APICounter.get(api))
    }

    /**
     * 增加指定API的请求计数
     * @param api - APILayer对象
     * @returns 返回增加后的请求计数值
     */
    addAPIRequest(api?: APILayer) {
        if(!api)
            return 0;

        if(!this.APICounter.has(api))
            this.APICounter.set(api, new RequestCounter(this.valve, this));

        return (<RequestCounter>this.APICounter.get(api)).addRequest();
    }

    /**
     * 重置计数器
     * @param now - 可选参数，指定重置的时间戳，如果不传则使用当前时间戳
     */
    reset(now?: number) {
        const count = this.count;
        this.logger.info(`[rate-count] reset count: ${count}`);
        // 将计数器重置为0，并更新上次计数重置的时间戳
        this.count = 0;
        if(!this.parent)
            return this.lastReset = now || Date.now();

        return this.lastReset = this.parent.lastReset;
    }
}

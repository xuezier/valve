import { cpuUsage, hrtime, memoryUsage } from "process";
import { Trigger } from "../../core/trigger/function/Trigger";
import { EPerformanceCollector } from "../../core/trigger/event/EPerformanceCollector";
import { getCPUUsage } from "./cpu/cpu";
import { TUsage } from "./type/Usage";
import { Module } from "../base/Module";

export class PerformanceCollector extends Module {
    private _startTime = hrtime();
    private _cpuUsage = cpuUsage();

    private _trigger = new Trigger<EPerformanceCollector>();
    get trigger() {
        return this._trigger;
    }

    get startTime() {
        return this._startTime;
    }

    get cpuUsage() {
        return this._cpuUsage;
    }

    private _usage: TUsage = {
        cpu: 0,
        memory: 0,
    };
    get usage() {
        return this._usage;
    }

    private interval: NodeJS.Timer;

    on(event: EPerformanceCollector, listener: (...args) => void) {
        return this.trigger.on.apply(this, [event, listener]);
    }

    once(event: EPerformanceCollector, listener: (...args) => void) {
        return this.trigger.on.apply(this, [event, listener]);
    }

    emit(event: EPerformanceCollector, ...args) {
        return this.trigger.emit.apply(this, [event, ...args]);
    }

    private _getCPUUsage() {
        const endTime = hrtime();
        const endUsage = cpuUsage();

        const usage = getCPUUsage(this.startTime, this.cpuUsage, endTime, endUsage);
        this._startTime = endTime;
        this._cpuUsage = endUsage;;

        return usage;
    }

    collect(interval: number) {
        this.interval = setInterval(() => {
            const cpu = this._getCPUUsage();
            const memory = memoryUsage();

            this._usage = {
                cpu: cpu,
                memory: memory.rss,
            };

            this.emit('collect', this.usage);
        }, interval);
    }

    constructor() {
        super();

        this.on('restart', this.reCollect.bind(this));
        this.once('start', this.reCollect.bind(this));
    }

    private reStore() {
        this._startTime = hrtime();
        this._cpuUsage = cpuUsage();;
    }

    private reCollect(interval: number) {
        clearInterval(this.interval as any);

        this.reStore();
        this.collect(interval);
    }
}
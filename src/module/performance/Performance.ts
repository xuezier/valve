import { cpuUsage, hrtime, memoryUsage } from "process";
import { Trigger } from "../../core/trigger/function/Trigger";
import { EPerformanceCollector } from "../../core/trigger/event/EPerformanceCollector";
import { getCPUUsage } from "./cpu/cpu";
import { TUsage } from "./type/Usage";

export class PerformanceCollector extends Trigger<EPerformanceCollector> {
    private _startTime = hrtime();
    private _cpuUsage = cpuUsage();

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
        clearInterval(this.interval);

        this.reStore();
        this.collect(interval);
    }
}
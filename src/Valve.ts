import * as assert from 'assert';
import * as os from 'os';

import { Config } from "./config/Config";
import { EValve } from "./core/trigger/event/EValve";
import { Trigger } from "./core/trigger/function/Trigger";
import { RateLimitingController, RequestCounter } from "./module";
import { ValveOptions } from './ValveOptions';
import { Logger } from './util/Logger';
import { Injector } from './core/server/Injector';
import { PerformanceCollector } from './module/performance/Performance';
import { convertStorage, testStorage } from './util/storage';
import { register } from './core/events/register';

export class Valve extends Trigger<EValve> {
    private _hostname = os.hostname();
    get hostname() {
        return this._hostname;
    }

    private _arch = os.arch();
    get arch() {
        return this._arch;
    }

    private _pid = process.pid;
    get pid() {
        return this._pid;
    }

    private _config = new Config();
    get config() {
        return this._config;
    }

    private _counter = new RequestCounter(this);
    get counter() {
        return this._counter;
    }

    private _rateLimitingController = new RateLimitingController(this);
    get rateLimitingController() {
        return this._rateLimitingController;
    }

    private _performanceCollector = new PerformanceCollector(this);
    get performanceCollector() {
        return this._performanceCollector;
    }

    private _logger: Logger;
    get logger() {
        return this._logger;
    }

    Injector = Injector;

    constructor(options: ValveOptions) {
        super();
        Injector.valve = this;

        const { enable = true, rule, interval, message, statusCode, isSendRetry, requestPropertyName, logger, debug = false, filters = [], performance } = options;
        this._logger = new Logger(console, debug);
        if(logger)
            this.logger.logger = logger;

        this.rateLimitingController.logger = this.logger;


        if(interval) {
            assert(typeof interval === 'number', new TypeError(`options.interval must be a number`));
            this.config.interval = interval;
        }

        if (rule) {
            const { api = [], server, ip } = rule;

            this.config.rule.api.addRules(api);
            if(server)
                this.config.rule.server.limit = server.limit;

            if(ip) {
                this.config.rule.ip.setOptions({ ...ip, interval: this.config.interval });
            }
        }

        if (message) {
            assert(typeof message === 'string' && message.length < 512, new TypeError(`options.message must be a string and its length must be less than 512`));
            this.config.message = message;
        }

        if(statusCode) {
            assert(statusCode >= 400 && statusCode < 600, new TypeError(`options.statusCode must be a number and its value must be between 400 and 600`));
            this.config.statusCode = statusCode;
        }

        this.config.isSendRetry = !!isSendRetry;

        if(requestPropertyName) {
            assert(typeof requestPropertyName === 'string' && requestPropertyName.length < 512, new TypeError(`options.requestPropertyName must be a string and its length must be less than 512`));
        }

        if(performance) {
            const { limit, recovery, enable, limitThreshold, recoveryThreshold } = performance;
            if (enable) {
                assert(!!limit && !!recovery, new TypeError(`options.performance.limit and options.performance.recovery must be set`));
                this.config.performance.enable = true;

                if(limit) {
                    const { cpu, memory } = limit;
                    if(cpu) {
                        assert(typeof cpu === 'number' && cpu > 0 && cpu < 1, new TypeError(`options.performance.limit.cpu must be a number and its value must be between 0 and 1`));
                        this.config.performance.limit.cpu = cpu;
                    }
                    if(memory) {
                        assert(typeof memory === 'string' && testStorage(memory), new TypeError(`options.performance.limit.memory must be a string and its value must be a valid storage like 100MB`));
                        this.config.performance.limit.memory = convertStorage(memory, 'B');
                    }
                }
                if(recovery) {
                    const { cpu, memory } = recovery;
                    if(cpu) {
                        assert(typeof cpu === 'number' && cpu > 0 && cpu < 1, new TypeError(`options.performance.recovery.cpu must be a number and its value must be between 0 and 1`));
                        this.config.performance.recovery.cpu = cpu;
                    }
                    if(memory) {
                        assert(typeof memory === 'string' && testStorage(memory), new TypeError(`options.performance.recovery.memory must be a string and its value must be a valid storage like 100MB`));
                        this.config.performance.recovery.memory = convertStorage(memory, 'B');
                    }
                }

                if(this.config.performance.limit.cpu <= this.config.performance.recovery.cpu)
                    throw new TypeError(`options.performance.limit.cpu must be greater than options.performance.recovery.cpu`);

                if(this.config.performance.limit.memory <= this.config.performance.recovery.memory)
                    throw new TypeError(`options.performance.limit.memory must be greater than options.performance.recovery.memory`);

                if(limitThreshold) {
                    assert(typeof limitThreshold === 'number' && limitThreshold > 0, new TypeError(`options.performance.limitThreshold must be a number and its value must be greater than 0`));
                    this.config.performance.limitThreshold = ~~limitThreshold;
                }

                if(recoveryThreshold) {
                    assert(typeof recoveryThreshold === 'number' && recoveryThreshold > 0, new TypeError(`options.performance.recoveryThreshold must be a number and its value must be greater than 0`));
                    this.config.performance.recoveryThreshold = ~~recoveryThreshold;
                }
            }
        }

        this.config.enable = !!enable;
        this.rateLimitingController.setFilter(...filters);

        register(this);
        if(this.config.enable)
            this.emit('ready');
    }
}
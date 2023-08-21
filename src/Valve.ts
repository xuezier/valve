import * as assert from 'assert';
import * as os from 'os';

import { Config } from "./config/Config";
import { EValve } from "./core/trigger/event/EValve";
import { Trigger } from "./core/trigger/function/Trigger";
import { RateLimitingController, RequestCounter } from "./module";
import { install } from './core/server/install';
import { ValveOptions } from './ValveOptions';
import { Logger } from './util/Logger';

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

    private _logger: Logger;
    get logger() {
        return this._logger;
    }

    constructor(options: ValveOptions) {
        super();

        const { rule, interval, message, statusCode, isSendRetry, requestPropertyName, logger, debug = false, filters = [] } = options;
        this._logger = new Logger(console, debug);
        if(logger)
            this.logger.logger = logger;


        if(interval) {
            assert(typeof interval === 'number', new TypeError(`options.interval must be a number`));
            this.config.interval = interval;
        }

        if (rule) {
            const { api = [], server } = rule;

            this.config.rule.api.addRules(api);
            if(server)
                this.config.rule.server.limit = server.limit;
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

        this.rateLimitingController.setFilter(...filters);

        install(this.rateLimitingController);
    }
}
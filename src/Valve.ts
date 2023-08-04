import * as assert from 'assert';

import { Config } from "./config/Config";
import { TRule } from "./config/rule/type/TRule";
import { TMethod } from "./core/server/type/TMethods";
import { EValve } from "./core/trigger/event/EValve";
import { Trigger } from "./core/trigger/function/Trigger";
import { RateLimitingController, RequestCounter } from "./module";
import { install } from './core/server/install';

export class Valve extends Trigger<EValve> {
    private _config = new Config();
    get config() {
        return this._config;
    }

    private _counter = new RequestCounter(this.config.interval);
    get counter() {
        return this._counter;
    }

    private _rateLimitingController = new RateLimitingController(this);
    get rateLimitingController() {
        return this._rateLimitingController;
    }

    constructor(options: {
        rule?: {
            api?: {
                path: string;
                method: TMethod;
                rule: TRule;
            }[];
            server?: {
                limit: number;
            }
        };
        interval?: number;
    }) {
        super();

        const { rule, interval } = options;

        if(interval) {
            assert(typeof interval === 'number', new TypeError(`options.interval must be a number`));
            this.config.interval = interval;

            this.counter.interval = interval;
        }

        if (rule) {
            const { api = [], server } = rule;

            this.config.rule.api.addRules(api);
            if(server)
                this.config.rule.server.limit = server.limit;
        }

        install(this.rateLimitingController);
    }
}
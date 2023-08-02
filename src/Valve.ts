import { Config } from "./config/Config";
import { EValve } from "./core/trigger/event/EValve";
import { Trigger } from "./core/trigger/function/Trigger";
import { RateLimitingController, RequestCounter } from "./module";

export class Valve extends Trigger<EValve> {
    private _config = new Config();
    get config() {
        return this._config;
    }

    private _counter = new RequestCounter(this.config.interval);
    get counter() {
        return this._counter;
    }

    private _rateLimitingController = new RateLimitingController();
    get rateLimitingController() {
        return this._rateLimitingController;
    }
}
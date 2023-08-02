import { EConfig } from "../core/trigger/event/EConfig";
import { Trigger } from "../core/trigger/function/Trigger";
import { loadEnv } from "./load-env";
import { ServerRuleConfig } from "./rule/Server";

export class Config extends Trigger<EConfig> {
    private _interval = loadEnv('VALVE_INTERVAL', 60 * 1000);
    get interval() {
        return this._interval;
    }

    rule = {
        server: new ServerRuleConfig()
    }
}
import { EConfig } from "../core/trigger/event/EConfig";
import { Trigger } from "../core/trigger/function/Trigger";
import { loadNumber } from "./load-env";
import { APIRuleConfig } from "./rule/API";
import { ServerRuleConfig } from "./rule/Server";

export class Config extends Trigger<EConfig> {
    private _interval = loadNumber('VALVE_INTERVAL', 60 * 1000);
    get interval() {
        return this._interval;
    }

    rule = {
        server: new ServerRuleConfig(),
        api: new APIRuleConfig(),
    }
}
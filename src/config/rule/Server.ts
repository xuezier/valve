import { EServerRule } from "../../core/trigger/event/ERule";
import { Trigger } from "../../core/trigger/function/Trigger";
import { loadNumber } from "../load-env";

export class ServerRuleConfig extends Trigger<EServerRule> {
    // 默认无限制
    private _limit = loadNumber('VALVE_SERVER_LIMIT', Number.POSITIVE_INFINITY);
    get limit() {
        return this._limit;
    }

    set limit(limit: number) {
        this._limit = limit;
    }
}
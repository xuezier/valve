import * as assert from 'assert';

import { EServerRule } from "../../core/trigger/event/ERule";
import { Trigger } from "../../core/trigger/function/Trigger";
import { loadNumber } from "../load-env";

export class ServerRuleConfig extends Trigger<EServerRule> {
    // 默认无限制
    private _limit = loadNumber('VALVE_SERVER_LIMIT', Number.POSITIVE_INFINITY);
    get limit() {
        return this._limit;
    }

    private _previousLimit = this.limit;

    set limit(limit: number) {
        assert(typeof limit === 'number' && limit > 0, new TypeError(`server rule limit must be a number and bigger than 0, bug got value: ${limit}`));

        this._previousLimit = this._limit;
        this._limit = limit;
    }

    restore() {
        this._limit = this._previousLimit;
    }
}
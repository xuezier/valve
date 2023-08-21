import { IncomingMessage, ServerResponse } from 'http';

import { Config } from "../../config/Config";
import { RateLimitingController } from "../rate";
import { RequestCounter } from "../request";
import { TMethod } from '../../core/server/type/TMethods';
import { Logger } from '../../util/Logger';

const PropertyCounter = Symbol('Pacher#Counter');
const PropertyRateController = Symbol('Pacher#RateController');
const PropertyConfig = Symbol('Pacher#Config');
const ProperLogger = Symbol('Pacher#Logger');

export class Patcher {
    private [PropertyCounter]: RequestCounter;

    private [PropertyRateController]: RateLimitingController;

    private [PropertyConfig]: Config;
    private [ProperLogger]: Logger;

    private request: IncomingMessage;
    private response: ServerResponse;

    constructor(rate: RateLimitingController, request: IncomingMessage, response: ServerResponse) {
        this[PropertyRateController] = rate,
        this[PropertyConfig] = rate.config;
        this[PropertyCounter] = rate.counter;
        this[ProperLogger] = rate.logger;

        this.request = request;
        this.response = response;
    }

     // 获取请求计数的信息
     get count() {
        return {
            total: this[PropertyCounter].count,
            api: this[PropertyCounter].getAPICounter(this[PropertyConfig].rule.api.getRule(this.request.url as string, this.request.method as TMethod))?.count || 0,
        };
    }

    // 将对象转换为 JSON 格式
    toJSON() {
        return {
            name: 'rate-pacher',
            count: this.count,
        };
    }

    // 手动触发请求限制并返回限制的响应
    limit() {
        this[ProperLogger].debug(`manually triggered current limitingt: ${this.request.method} ${this.request.url}`);
        return this[PropertyRateController].responseLimited(this.response);
    }
}
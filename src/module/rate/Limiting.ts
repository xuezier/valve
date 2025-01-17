import { IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';

import { ERateLimitingController } from "../../core/trigger/event/ERateLimitingController";
import { Trigger } from "../../core/trigger/function/Trigger";
import { Module } from "../base/Module";
import { Filter } from "./type/Filter";
import { RequestCounter } from '../request';
import { Valve } from '../../Valve';
import { Config } from '../../config/Config';
import { TMethod } from '../../core/server/type/TMethods';
import { TRule } from '../../config/rule/type/TRule';
import { Logger } from '../../util/Logger';
import { getRealIP } from '../../util/get-real-ip';

// RateLimitingController类用于控制请求的限流
export class RateLimitingController extends Module {
    // 触发器实例，用于触发事件
    private _trigger = new Trigger<ERateLimitingController>()
    get trigger() {
        return this._trigger;
    }

    // 存储过滤器的数组
    private _filters: Filter[] = [];
    get filters() {
        return this._filters;
    }

    // 请求计数器实例
    private _counter: RequestCounter;
    get counter() {
        return this._counter;
    }

    // 配置对象实例
    private _config: Config;
    get config() {
        return this._config;
    }

    private _logger: Logger;
    get logger() {
        return this._logger;
    }
    set logger(logger) {
        this._logger = logger;
    }

    force = false;

    // 构造函数
    constructor(valve: Valve) {
        super(valve);

        // 获取请求计数器实例
        this._counter = valve.counter;
        this._config = valve.config;
        this._logger = valve.logger;
    }

    setFilter(...filters: Filter[]) {
        this.filters.push(...filters)

        if(this.filters.length > 20)
            this.logger.warn(`more than 20 filters, may have a performance impact`);

    }

    /**
     * 判断请求是否被限流
     * @param request - 请求对象
     * @returns 返回一个布尔值，表示请求是否被限流
     */
    async isLimitingRequest(request: IncomingMessage, response: ServerResponse) {
        // 获取请求对应的API规则
        const path = new url.URL(request.url!, `http://${request.headers.host!}`).pathname;
        const APIRule = this.config.rule.api.getRule(path, request.method as TMethod);
        // 增加总请求计数
        const requests = this.counter.addRequest();
        // 增加API请求计数，如果没有对应的API规则，则APIRequests为0
        const APIRequests = APIRule ? this.counter.addAPIRequest(APIRule) : 0;

        // 过滤器判断，如果通过所有过滤器，则不被限流
        const isFilterPass = this.filter(request, response);
        if(isFilterPass)
            return false;

        if(this.config.rule.ip.enbale) {
            const isIPLimited = await this.config.rule.ip.isLimiting(getRealIP(request));

            if(isIPLimited)
                return true;
        }

        // 判断总请求数是否超过服务器限制
        const isServerLimited = this.isServerLimited(requests);
        // 判断API请求数是否超过API规则的限制
        const isAPILimited = this.isAPILimited(APIRequests, APIRule?.rule);

        return isServerLimited || isAPILimited;
    }

    // 判断总请求数是否超过服务器限制
    private isServerLimited(request: number) {
        return request > this.config.rule.server.limit;
    }

    // 判断API请求数是否超过API规则的限制
    private isAPILimited(request: number, rule?: TRule) {
        if(!rule)
            return false;

        return request > rule.limit;
    }

    // 执行过滤器判断
    private filter(request: IncomingMessage, response: ServerResponse) {
        for(const filter of this.filters) {
            const isPass = filter(request, response);

            if(isPass)
                return isPass;
        }

        return false;
    }

    /**
     * 返回限流响应
     * @param response - 响应对象
     * @returns 返回一个布尔值，表示是否已发送限流响应
     */
    responseLimited(response: ServerResponse) {
        if(this.config.isSendRetry)
            response.setHeader('Retry-After', this.counter.interval / 1000);

        // 发送429状态码和限流响应内容
        response.writeHead(this.config.statusCode, { 'Content-Type': 'text/plain' });
        response.end(this.config.message);

        return true;
    }
}

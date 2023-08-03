import { IncomingMessage, ServerResponse } from 'http';

import { ERateLimitingContriller } from "../../core/trigger/event/ERateLimitingController";
import { Trigger } from "../../core/trigger/function/Trigger";
import { Module } from "../base/Module";
import { Filter } from "./type/Filter";
import { RequestCounter } from '../request';
import { Valve } from '../../Valve';
import { Config } from '../../config/Config';
import { TMethod } from '../../core/server/type/TMethods';
import { TRule } from '../../config/rule/type/TRule';

// RateLimitingController类用于控制请求的限流
export class RateLimitingController extends Module {
    // 触发器实例，用于触发事件
    private _trigger = new Trigger<ERateLimitingContriller>()
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

    // 构造函数
    constructor(valve: Valve) {
        super();

        // 获取请求计数器实例
        this._counter = valve.counter;
    }

    /**
     * 判断请求是否被限流
     * @param request - 请求对象
     * @returns 返回一个布尔值，表示请求是否被限流
     */
    isLimitingRequest(request: IncomingMessage) {
        // 获取请求对应的API规则
        const APIRule = this.config.rule.api.getRule(request.url as string, request.method as TMethod);
        // 增加总请求计数
        const requests = this.counter.addRequest();
        // 增加API请求计数，如果没有对应的API规则，则APIRequests为0
        const APIRequests = APIRule ? this.counter.addAPIRequest(APIRule.layer) : 0;

        // 过滤器判断，如果通过所有过滤器，则不被限流
        const isFilterPass = this.filter(request);
        if(isFilterPass)
            return false;

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
    private filter(request: IncomingMessage) {
        for(const filter of this.filters) {
            const isPass = filter(request);

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
        // 发送429状态码和限流响应内容
        response.writeHead(429, { 'Content-Type': 'text/plain' });
        response.end(`Too many requests from this IP, please try again in ${this.counter.interval}s.`);

        return true;
    }
}

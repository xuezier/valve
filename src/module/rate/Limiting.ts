import { IncomingMessage, ServerResponse } from 'http';

import { ERateLimitingContriller } from "../../core/trigger/event/ERateLimitingController";
import { Trigger } from "../../core/trigger/function/Trigger";
import { Module } from "../base/Module";
import { Filter } from "./type/Filter";
import { RequestCounter } from '../request';
import { Valve } from '../../Valve';
import { Config } from '../../config/Config';

export class RateLimitingController extends Module {
    private _trigger = new Trigger<ERateLimitingContriller>()
    get trigger() {
        return this._trigger;
    }

    private _filters: Filter[] = [];
    get filters() {
        return this._filters;
    }

    private _counter: RequestCounter;
    get counter() {
        return this._counter;
    }

    private _config: Config;
    get config() {
        return this._config;
    }

    constructor(valve: Valve) {
        super();

        this._counter = valve.counter;
    }

    isLimitingRequest(request: IncomingMessage) {
        const isFilterPass = this.flit(request);
        const requests = this._counter.addRequest();

        if(isFilterPass)
            return false;

        const isServerLimited = this.isServerLimited(requests);
        if(isServerLimited)
            return isServerLimited;


        return false;


    }

    private isServerLimited(request: number) {
        return request > this.config.rule.server.limit;
    }

    private flit(request: IncomingMessage) {
        for(const filter of this.filters) {
            const isPass = filter(request);

            if(isPass)
                return isPass;
        }

        return false;
    }

    responseLimited(response: ServerResponse) {
        response.writeHead(429, { 'Content-Type': 'text/plain' });
        response.end(`Too many requests from this IP, please try again in ${this.counter.interval}s.`);

        return true;
    }
}
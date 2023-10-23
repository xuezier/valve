import * as http from 'http'
import { Patcher } from '../../module/patch/Pacher';
import { Injector } from './Injector';

export function httpCallback(callback: http.RequestListener) {
    return async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const valve = Injector.valve;
        if(valve.config.enable === false)
            return callback(req, res);

        const rate = valve.rateLimitingController;
        Object.defineProperty(req, rate.config.requestPropertyName, {
            value: new Patcher(rate, req, res),
            enumerable: false,
            configurable: false,
            writable: false,
        });

        const isLimitedRequest = await rate.isLimitingRequest(req, res);
        if(isLimitedRequest)
            return rate.responseLimited(res);

        return callback(req, res);
    }
}
import * as http from 'http'
import { Patcher } from '../../module/patch/Pacher';
import { Injector } from './Injector';

export function httpCallback(callback: http.RequestListener) {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
        const rate = Injector.rate;

        Object.defineProperty(req, rate.config.requestPropertyName, {
            value: new Patcher(rate, req, res),
            enumerable: false,
            configurable: false,
            writable: false,
        });

        const isLimitedRequest = rate.isLimitingRequest(req);
        if(isLimitedRequest)
            return rate.responseLimited(res);

        return callback(req, res);
    }
}
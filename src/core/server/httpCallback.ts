import * as http from 'http'
import { RateLimitingController } from '../../module';
import { Patcher } from '../../module/patch/Pacher';

export function httpCallback(callback: http.RequestListener, rate: RateLimitingController) {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
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
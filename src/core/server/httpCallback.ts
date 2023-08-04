import * as http from 'http'
import { RateLimitingController } from '../../module';

export function httpCallback(callback: http.RequestListener, rate: RateLimitingController) {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
        const isLimitedRequest = rate.isLimitingRequest(req);
        if(isLimitedRequest)
            return rate.responseLimited(res);

        return callback(req, res);
    }
}
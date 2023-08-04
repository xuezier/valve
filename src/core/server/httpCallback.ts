import * as http from 'http'

export function httpCallback(callback: http.RequestListener) {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
        return callback(req, res);
    }
}
import { Trigger } from "../../core/trigger/function/Trigger";
import { WebSocket } from "../socket/WebSocket";
import { Econnection } from "./type/EConnection";
import { Options } from "./type/Options";

type STATUS = 'connecting' | 'connected' | 'closing' | 'closed';

export class Connection extends Trigger<Econnection> {
    status: STATUS = 'connecting';

    socket: WebSocket;

    constructor(options: Options) {
        super()

        const { server, appid, secret } = options;
        const socket = WebSocket.connect({
            host: server.host,
            port: server.port || 80,
        });

        socket.once('connection', () => {
            socket.sendMessage({ appid, secret });
        })
    }
}
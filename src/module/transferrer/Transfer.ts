import { Logger } from "../../util/Logger";
import { ClientSocket } from "./ClientSocket";
import { connect } from "./connect";

export class Transfer {
    static socket: ClientSocket;

    static async connect(config: { sockPath: string; logger: Logger }) {
        const socket = (await connect(config))!;

        this.socket = socket;
    }

    static send() {
        return this._send();
    }

    private static _send() {
        if(!this.socket)
            return;
    }
}
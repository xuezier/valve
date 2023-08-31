import { ServerSocket } from "./ServerSocket";

export class SocketRegistry {
    private static sockets: Map<number, ServerSocket> = new Map();

    static setSocket(pid: number, socket: ServerSocket) {
        this.sockets.set(pid, socket);
    }
}
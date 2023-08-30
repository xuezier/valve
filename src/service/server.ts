import * as net from 'net';
import * as fs from 'fs';

import { ServerOptions } from './type/ServerOptions';
import { Logger } from '../util/Logger';
import { ServerSocket } from './socket/ServerSocket';

export function startServer(config: ServerOptions) {
    const logger = new Logger();

    try {
        fs.unlinkSync(config.sockPath);

        const server = net.createServer((socket) => {
            const handleSocket = new ServerSocket(socket);
            handleSocket.load();

            socket.once('error', (err) => {
                console.error(err);
            });
        });

        server.listen(config.sockPath, () => {
            logger.info(`Vavle client Server started at ${config.sockPath}`);
        });
    }
    catch (err) {
        console.log(err)
    }
}
import * as net from 'net';
import { Logger } from '../../util/Logger';
import { ClientSocket } from './ClientSocket';
import { sleep } from '../../util/sleep';
export async function connect(config: {
    sockPath: string;
    logger: Logger;
}) {
    const { sockPath, logger } = config;
    let retryTimes = 0;

    while(retryTimes < 5) {
        try {
            const socket = net.connect(sockPath);

            return new ClientSocket(socket);
        }
        catch(err) {
            retryTimes++;
            logger.error(`err`);
            await sleep(3000);
        }

        throw new Error('connect local valve server failed, please check server started and sockPath is correct');
    }
}
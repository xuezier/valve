import { IncomingMessage } from 'http';

export type Filter = (req: IncomingMessage) => boolean;
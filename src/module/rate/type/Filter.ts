import { IncomingMessage } from 'http';

export type Filter = (request: IncomingMessage) => boolean;
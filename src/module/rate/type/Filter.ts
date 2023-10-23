import { IncomingMessage, ServerResponse } from 'http';

export type Filter = (request: IncomingMessage, response: ServerResponse) => boolean;
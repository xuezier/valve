import { Options as ConnectionOptions } from '../connection/type/Options';

export type ServerOptions = {
    sockPath: string;
} & ConnectionOptions;

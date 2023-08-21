import { TRule } from "./config/rule/type/TRule";
import { TMethod } from "./core/server/type/TMethods";

export type ValveOptions = {
    rule?: {
        api?: {
            path: string;
            method: TMethod;
            rule: TRule;
        }[];
        server?: {
            limit: number;
        }
    };
    interval?: number;
    message?: string;
    statusCode?: number;
    isSendRetry?: boolean;
    requestPropertyName?: string;

    logger?: any;
    debug?: boolean;
}
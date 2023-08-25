import { TRule } from "./config/rule/type/TRule";
import { TStorage } from "./config/rule/type/TStorage";
import { TMethod } from "./core/server/type/TMethods";
import { Filter } from "./module/rate/type/Filter";

export type ValveOptions = {
    enable?: boolean;

    rule?: {
        api?: {
            path: string;
            method: TMethod;
            rule: TRule;
        }[];
        server?: {
            limit: number;
        };
        ip?: {
            storage?: TStorage;
            limit: number;
            whiteList?: string[];
            blackList?: string[];
        }
    };
    interval?: number;
    message?: string;
    statusCode?: number;
    isSendRetry?: boolean;
    requestPropertyName?: string;

    logger?: any;
    debug?: boolean;

    filters?: Filter[];

    performance?: {
        enable?: boolean;
        limitThreshold?: number;
        limit?: {
            cpu?: number;
            memory?: string;
        };
        recoveryThreshold?: number;
        recovery?: {
            cpu?: number;
            memory?: string;
        }
    }
}
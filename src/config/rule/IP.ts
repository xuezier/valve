import { Storage } from "./storage/Storage";
import { TStorage } from "./type/TStorage";

// IP 类型枚举，表示白名单和黑名单
enum IP_TYPE {
    White,
    Black,
}

/**
 * IP 规则配置类，用于管理 IP 访问规则。
 */
export class IPRuleConfig {
    storage: Storage;
    private limit: number;

    // 使用 Map 存储 IP 和对应的类型
    private list: Map<string, IP_TYPE> = new Map();

    enbale = false;

    /**
     * 构造函数，初始化 IP 规则配置。
     *
     * @param options - 可选的配置参数。
     */
    constructor(options?) {
        this.setOptions(options);
    }

    /**
     * 设置 IP 规则配置的选项。
     *
     * @param options - 配置选项。
     */
    setOptions(options?: {
        interval: number;
        storage?: TStorage;
        limit: number;
        whiteList?: string[];
        blackList?: string[];
        enable?: boolean;
    }) {
        if (!options) return;

        const { storage, interval, limit, whiteList, blackList, enable } = options;

        this.storage = new Storage({ storage, interval });
        this.limit = ~~limit;
        this.enbale = !!enable;
        this.setWhite(whiteList || []);
        this.setBlock(blackList || []);
    }

    /**
     * 设置白名单 IP 列表。
     *
     * @param ips - IP 列表。
     */
    setWhite(ips: string[]) {
        ips = [...new Set(ips)];

        ips.map(ip => this.list.set(ip, IP_TYPE.White));
    }

    /**
     * 设置黑名单 IP 列表。
     *
     * @param ips - IP 列表。
     */
    setBlock(ips: string[]) {
        ips = [...new Set(ips)];

        ips.map(ip => this.list.set(ip, IP_TYPE.Black));
    }

    /**
     * 检查 IP 是否在白名单中。
     *
     * @param ip - 要检查的 IP。
     * @returns 如果在白名单中则返回 true，否则返回 false。
     */
    isWhite(ip: string) {
        return this.list.get(ip) === IP_TYPE.White;
    }

    /**
     * 检查 IP 是否在黑名单中。
     *
     * @param ip - 要检查的 IP。
     * @returns 如果在黑名单中则返回 true，否则返回 false。
     */
    isBlock(ip: string) {
        return this.list.get(ip) === IP_TYPE.Black;
    }

    /**
     * 检查 IP 是否达到限制。
     *
     * @param ip - 要检查的 IP。
     * @returns 如果 IP 达到限制则返回 true，否则返回 false。
     */
    async isLimiting(ip?: string) {
        if(!ip) return true;

        if (this.isWhite(ip)) return false;

        if (this.isBlock(ip)) return true;

        const count = await this.storage.incr(ip);

        return count > this.limit;
    }

    start() {
        if(this.enbale)
            this.storage.start();
    }
}

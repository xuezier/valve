// 导入所需模块和类
import { EConfig } from "../core/trigger/event/EConfig";
import { Trigger } from "../core/trigger/function/Trigger";
import { loadNumber } from "./load-env";
import { APIRuleConfig } from "./rule/API";
import { IPRuleConfig } from "./rule/IP";
import { ServerRuleConfig } from "./rule/Server";

// 创建 Config 类，继承自 Trigger<EConfig> 类
export class Config extends Trigger<EConfig> {
    enable = true;

    // 私有属性 _interval，用于存储时间间隔，默认为加载环境变量 'VALVE_INTERVAL' 的值，单位为毫秒
    private _interval = loadNumber('VALVE_INTERVAL', 60 * 1000);

    // 获取时间间隔的访问器方法
    get interval() {
        return this._interval;
    }

    // 设置时间间隔的访问器方法
    set interval(interval: number) {
        this._interval = interval * 1000; // 将传入的 interval 值转换为毫秒并赋值给 _interval
    }

    private _message = 'Too many requests, please try again later';
    get message() {
        return this._message;
    }

    set message(message: string) {
        this._message = message;
    }

    private _statusCode = 429;
    get statusCode() {
        return this._statusCode;
    }

    set statusCode(statusCode: number) {
        this._statusCode = statusCode;
    }

    private _requestPropertyName = 'valve';
    get requestPropertyName() {
        return this._requestPropertyName;
    }

    set requestPropertyName(requestPropertyName: string) {
        this._requestPropertyName = requestPropertyName;
    }

    // 包含不同规则配置的 rule 对象
    rule = {
        server: new ServerRuleConfig(), // 用于服务器规则的配置
        api: new APIRuleConfig(),       // 用于 API 规则的配置
        ip: new IPRuleConfig(),         // 用于 IP 规则的配置
    }

    // 私有属性 _isSendRetry，用于标识是否发送重试请求，默认为 false
    private _isSendRetry = false;

    // 获取是否发送重试请求的访问器方法
    get isSendRetry() {
        return this._isSendRetry;
    }

    // 设置是否发送重试请求的访问器方法
    set isSendRetry(isSendRetry) {
        this._isSendRetry = isSendRetry;
    }

    performance = {
        enable: false,
        collectInterval: 5000,
        limitThreshold: 2,
        limit: {
            cpu: 0,
            memory: 0,
        },
        recoveryThreshold: 1,
        recovery: {
            cpu: 0,
            memory: 0,
        }
    }
}

import * as http from 'http';
import { Patcher } from '../../module/patch/Pacher';
import { Injector } from './Injector';

/**
 * 包装 HTTP 请求回调函数，用于实现请求速率限制功能。
 *
 * @param callback - 原始的 HTTP 请求回调函数。
 * @returns 一个新的 HTTP 请求回调函数，具备请求速率限制功能。
 */
export function httpCallback(callback: http.RequestListener) {
    return async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const rate = Injector.rate; // 获取速率限制配置

        // 如果速率限制功能被禁用，直接调用原始回调函数
        if (rate.config.enable === false) {
            return callback(req, res);
        }

        // 在请求对象中添加一个不可枚举的属性，用于存储 Patcher 实例
        Object.defineProperty(req, rate.config.requestPropertyName, {
            value: new Patcher(rate, req, res), // 创建 Patcher 实例
            enumerable: false,
            configurable: false,
            writable: false,
        });

        // 判断当前请求是否受到速率限制
        const isLimitedRequest = await rate.isLimitingRequest(req);

        // 如果受到速率限制，返回限制响应
        if (isLimitedRequest) {
            return rate.responseLimited(res);
        }

        // 否则，调用原始回调函数处理请求
        return callback(req, res);
    };
}

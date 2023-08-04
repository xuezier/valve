import * as http from 'http';
import { httpCallback } from './httpCallback';
import { RateLimitingController } from '../../module';

const httpCreateServer = http.createServer;

export function install(rate: RateLimitingController) {
    //定义 http 对象的 createServer 方法
    Object.defineProperty(http, 'createServer', {
        //value 属性定义了 createServer 方法的具体功能，它接受 options 和 callback 两个参数
        value: (options: http.ServerOptions, callback?: http.RequestListener) => {
            //如果参数 options 的类型是函数类型，则将该参数赋值给回调变量 callback
            if(typeof options === 'function') {
                callback = options;

                return httpCreateServer(httpCallback(callback, rate));
            }

            return httpCreateServer(options, httpCallback(callback as any, rate));
        }
    })
}
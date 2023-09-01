# Valve
Node.js HTTP rate limiting plugin. Based on native http module, Frameless !!!

# Installation

```bash
npm install @gaoding/valve [--save]
```

# Usage

- [x] 接口限流
- [x] 服务限流
- [ ] ip 隔离
- [x] 手动触发
- [x] 拦截器 - filter

## Configuration

- `enable` - `Optional, type:Boolean`, 是否开启限流，默认 true
- `rule` - `Optional, type:Object`, 限流规则, 默认无上限
- `rule.api` - `Optional, type:Array<Object>`, API 限流规则
- `rule.api.path` - `Required, type:String`, API 路径
- `rule.api.method` - `Required, type:'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | 'HEAD' | 'OPTIONS'`, 请求方式
- `rule.api.rule` - `Required, type:Object`, 限流规则
- `rule.api.rule.limit` - `Required, type:Number`, 窗口时间内请求上限
- `rule.server` - `Optional, type:Object`, 服务限流规则
- `rule.server.limit` - `Required, type:Number`, 窗口时间内服务请求上限
- `rule.ip` - `Optional, type:Object`, IP 限流规则
- `rule.ip.enable` - `Optional, type:Boolean`, 是否开启 IP 限流，默认 false
- `rule.ip.limit` - `Required, type:Number`, 窗口时间内 IP 请求上限
- `rule.ip.storage` - `Optional, type: String | RedisOptions`, IP 限流存储方式，默认内存存储 'memory', if use redis,please see ioredis configuration
- `rule.ip.whiteList` - `Optional, type:Array<String>`, IP 白名单, 优先级高于黑名单，白名单内的 IP 不经过限流
- `rule.ip.blackList` - `Optional, type:Array<String>`, IP 黑名单, 黑名单内的 IP 强制限流
- `interval` - `Optional, type:Number`, 窗口时间，单位秒，默认 60 秒
- `message` - `Optional, type:String`, 限流时响应内容，不配置则响应默认内容
- `statusCode` - `Optional, type:Number`, 限流时响应的 HTTP 状态码，默认 429
- `isSendRetry` - `Optional, type:Boolean`, 限流时是否响应 `Retry-After` 响应头，默认 false
- `requestPropertyName` - `Optional, type:String`, 限流信息绑定在 request 对象上的属性名，默认 `valve`
- `filters` - `Optional, type:Array<Filter>`, 限流拦截器，通过则对当前请求不限流，只要通过一个拦截器即可
- `logger`-`Optional, type:Any`, 自定义 Logger，默认 Console
- `performance`-`Optional,type:Object`, 性能配置，开启自适应限流的时候需要配置
- `performance.enable`-`Optional, type:Boolean`, 是否开启自适应限流，默认 false
- `performance.limitThreshold`-`Optional, type:Number`, 超过性能限制次数，当超过该次数，将开启限流，默认 2
- `performance.limit`-`Optional, type:Object`, 自适应限流的上限配置
- `performance.limit.cpu`-`Optional, type:Number`, cpu 上限，取值 0-1, 默认 1,
- `performance.limit.memory`-`Optional, type:String`, 内存上限，支持单位：`B`, `KB`, `MB`, `GB`，默认 '1GB',
- `performance.recoveryThreshold`-`Optional, type:Number`, 低于性能限制次数，当低于该次数，将关闭限流，默认 1
- `performance.recovery`-`Optional, type:Object`, 自适应限流的下限配置
- `performance.recovery.cpu`-`Optional, type:Number`, cpu 下限，取值 0-1, 默认 0,
- `performance.recovery.memory`-`Optional, type:String`, 内存下限，支持单位：`B`, `KB`, `MB`, `GB`，默认 '0GB',
- `debug`-`Optional, type:Boolean`, 是否输出调试日志，默认 false

```ts
type Filter = (request: http.IncomingMessage) => boolean;
```

Example:
```ts
const options = {
    enable: true,
    rule:{
        server: {
            limit: 300,
        }
    },
    api: [
        {
            method: 'GET',
            path: '/test1',
            rule: { limit: 100 }
        },
        {
            method: 'GET',
            path: '/test2/:id',
            rule: { limit: 150 }
        }
    ],
    interval: 10,
    message: 'Request sent too fast, please fill it out later',
    statusCode: 429,
    isSendRetry: false,
    filters: [
        (request) => {
            return request.headers['x-user-id'] == 1;
        }
    ],
    performance: {
        enable: true,
        limitThreshold: 2,
        limit: {
            cpu: 0.8,
            memory: '1GB',
        },
        recoveryThreshold: 1,
        recovery: {
            cpu: 0.2,
            memory: '0GB',
        },
    },
    debug: false,
}
```

## limit in request
通常情况下不需要认为操作，如果想要在代码中手动去触发限流，可参考：

```ts
import { Valve } from '@gaoding/ergate';
import * as http from 'http';

// Initialization configuration needs to be done before the http server starts
new Valve(ValveOptions);

http.createServer((request, response) => {
    console.log(request.valve.toJSON());        // { count: { total: 100, api: 10 } }

    if(request.headers['x-user-id'] === 1)
        return request.valve.limit();           // 在请求中手动执行限流

    res.write('hello world /' + req.url);
    res.end();
}).listen(2233);
```

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

- `rule` - `Optional, type:Object`, 限流规则, 默认无上限
- `rule.api` - `Optional, type:Array<Object>`, API 限流规则
- `rule.api.path` - `Required, type:String`, API 路径
- `rule.api.method` - `Required, type:'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | 'HEAD' | 'OPTIONS'`, 请求方式
- `rule.api.rule` - `Required, type:Object`, 限流规则
- `rule.api.rule.limit` - `Required, type:Number`, 窗口时间内请求上限
- `rule.server` - `Optional, type:Object`, 服务限流规则
- `rule.server.limit` - `Required, type:Number`, 窗口时间内服务请求上限
- `interval` - `Optional, type:Number`, 窗口时间，单位秒，默认 60 秒
- `message` - `Optional, type:String`, 限流时响应内容，不配置则响应默认内容
- `statusCode` - `Optional, type:Number`, 限流时响应的 HTTP 状态码，默认 429
- `isSendRetry` - `Optional, type:Boolean`, 限流时是否响应 `Retry-After` 响应头，默认 false
- `requestPropertyName` - `Optional, type:String`, 限流信息绑定在 request 对象上的属性名，默认 `valve`
- `filters` - `Optional, type:Array<Filter>`, 限流拦截器，通过则对当前请求不限流，只要通过一个拦截器即可
- `logger`-`Optional, type:Any`, 自定义 Logger，默认 Console
- `debug`-`Optional, type:Boolean`, 是否输出调试日志，默认 false

```ts
type Filter = (request: http.IncomingMessage) => boolean;
```

Example:
```ts
const options = {
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
    debug: false,
}
```

## limit in request

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

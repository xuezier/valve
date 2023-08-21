import { IncomingMessage } from 'http';

export function getRealIP(request: IncomingMessage) {
    // 从请求头中获取 X-Forwarded-For 头字段，表示客户端的真实 IP 地址列表
    const xForwardedFor = request.headers['x-forwarded-for'];

    // 从请求头中获取 X-Real-IP 头字段，表示客户端的真实 IP 地址
    const xRealIP = request.headers['x-real-ip'];

    // 优先使用 X-Forwarded-For 头字段获取客户端真实 IP 地址
    // 注意：X-Forwarded-For 是由多个代理服务器追加的，取最左侧的 IP 地址即为客户端真实 IP
    const clientIP = xForwardedFor ? (<string>xForwardedFor).split(',')[0] : <string>xRealIP;

    // 如果没有 X-Forwarded-For 头字段，则使用 X-Real-IP 头字段获取客户端真实 IP 地址
    // 如果两者都不存在，则使用 request.connection.remoteAddress 获取客户端 IP 地址
    // 注意：req.connection.remoteAddress 可能是代理服务器的 IP 地址，而不是客户端真实 IP
    const realIP = clientIP || (request.connection || request.socket).remoteAddress;

    return realIP;
}
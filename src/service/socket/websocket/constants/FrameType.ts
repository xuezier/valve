/**
 * 枚举 WebSocket 帧的类型
 */
export enum FrameType {
    CONTINUATION = 0x0, // 继续帧，用于分片消息的后续分片
    TEXT = 0x1,         // 文本帧，包含文本消息
    BINARY = 0x2,       // 二进制帧，包含二进制消息
    CLOSE = 0x8,        // 关闭帧，用于关闭连接
    PING = 0x9,         // Ping 帧，用于心跳检测
    PONG = 0xA,         // Pong 帧，用于回应 Ping 帧
}

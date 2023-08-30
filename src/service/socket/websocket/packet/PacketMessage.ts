import * as crypto from 'crypto';
import { FrameType } from '../constants/FrameType'; // 导入 WebSocket 帧类型的常量

// 定义一个 PacketMessage 类
export class PacketMessage {
    packet: Buffer; // PacketMessage 的数据包

    constructor(message: string) {
        const bytes = Buffer.from(message); // 将消息转换为字节数组
        const messageLength = bytes.length; // 消息的长度
        const mask = crypto.randomBytes(4); // 生成随机掩码

        let payloadLength = messageLength;
        let offset = 6;

        // 根据消息长度设置负载长度和偏移量
        if (messageLength >= 65536) {
            offset += 8;
            payloadLength = 127;
        } else if (messageLength > 125) {
            offset += 2;
            payloadLength = 126;
        }

        // 创建一个包含消息的数据包
        const packet = Buffer.alloc(messageLength + offset);
        packet[0] = FrameType.TEXT | 0x80; // 设置帧类型为文本帧，并启用 FIN
        packet[1] = payloadLength; // 设置负载长度

        // 根据负载长度写入消息长度信息
        if (payloadLength === 126)
            packet.writeUInt16BE(messageLength, 2);
        else if (payloadLength === 127) {
            packet[2] = packet[3] = 0;
            packet.writeUintBE(messageLength, 4, 6);
        }

        packet[1] |= 0x80; // 启用掩码
        packet[offset - 4] = mask[0];
        packet[offset - 3] = mask[1];
        packet[offset - 2] = mask[2];
        packet[offset - 1] = mask[3];

        // 对消息进行掩码处理
        this.mask(bytes, mask, packet, offset, messageLength);

        this.packet = packet; // 设置 PacketMessage 的数据包
    }

    // 对数据进行掩码处理
    private mask(source: Buffer, mask: Buffer, output: Buffer, offset: number, length: number) {
        for (let i = 0; i < length; i++)
            output[offset + i] = source[i] ^ mask[i & 3];
    }

    toString() {
        return this.packet; // 返回 PacketMessage 的数据包
    }
}

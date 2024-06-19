import { getFrameType } from "./getFrameType";
import { isFinalFrame } from "./isFinalFrame";

/**
 * 对 websocket 数据包进行拆解
 * @param chunk 二进制数据包
 * @returns [boolean, number, number, number, Buffer, Buffer]
 * [ isFinal,       opcode, payloadLength,  payloadStart,       payload,    remainderPayload]
 * [ 是否是最终数据包, 帧类型,  Payload长度,    Payload数据开始位置, Payload数据,   剩余数据 ]
 *
 */
export function resolveChunk(chunk: Buffer): [boolean, number, number, number, Buffer, Buffer] {
    // 判断数据包是否是最终数据包
    const isFinal = isFinalFrame(chunk[0]);
    // 获取数据包的帧类型
    const opcode = getFrameType(chunk[0]);

    // 获取数据包Payload长度
    let payloadLength = chunk[1] & 0x7F;
    let payloadStart = 2;

    // 如果Payload长度为126，则获取16位的Payload长度
    if(payloadLength === 126) {
        payloadStart = 4;

        // 如果Payload长度大于125，则获取对应长度的Payload长度
        const payloadLengthByte = chunk.subarray(2, payloadStart);
        payloadLength = payloadLengthByte.readUInt16BE();
    }
    // 如果Payload长度为127，则获取64位的Payload长度
    else if(payloadLength === 127) {
        payloadStart = 10;

        // 如果Payload长度大于125，则获取对应长度的Payload长度
        const payloadLengthByte = chunk.subarray(2, payloadStart);
        payloadLength = payloadLengthByte.readUInt32BE(4);
    }

    // 计算Payload数据的结束位置、获取Payload数据和获取Payload数据后面的剩余数据
    const payloadEnd = payloadStart + payloadLength;
    const payload = chunk.subarray(payloadStart, payloadEnd);
    const remainderPayload = chunk.subarray(payloadEnd);

    // 返回包含WebSocket数据包相关信息的数组
    return [isFinal, opcode, payloadLength, payloadStart, payload, remainderPayload];
}
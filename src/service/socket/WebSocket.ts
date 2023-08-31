import * as net from 'net';
import { Socket } from "net";
import { Trigger } from "../../core/trigger/function/Trigger";
import { EWebSocket } from "./event/EWebSocket";
import { connect } from './websocket/handler/connect';
import { Frame } from './websocket/Frame';
import { resolveChunk } from './websocket/handler/resolveChunk';
import { PacketMessage } from './websocket/packet/PacketMessage';

// WebSocket 状态类型
type STATUS = 'connecting' | 'connected' | 'closing' | 'closed';
// 数据状态类型
type DATA_STATUS = 'pending' | 'idle';

// WebSocket 类
export class WebSocket extends Trigger<EWebSocket> {
    // WebSocket 当前状态，默认为连接中
    status: STATUS = 'connecting';
    // 记录收到的数据块数
    private dataCount = 0;
    // 记录处理的帧数
    private frameCount = 0;

    // 数据状态，用于控制数据处理流程
    private dataStatus: DATA_STATUS = 'idle';
    // 当前处理的帧
    private currentFrame?: Frame;
    // 缓存待处理的数据块
    private frames: Buffer[] = [];

    // 构造函数，初始化 WebSocket
    constructor(private socket: Socket, auth: { appid: number; secret: string; hostname: string }) {
        super();

        // 监听 socket 数据事件，处理数据
        this.socket.on('data', this.handleSocketData.bind(this));

        // 监听 'data' 事件，处理数据
        this.on('data', this.handleData.bind(this));
        // 监听 'frame' 事件，处理帧
        this.on('frame', this.handleFrame.bind(this));

        // 连接 WebSocket
        connect(socket, auth);
    }

    // 处理 socket 收到的数据
    private handleSocketData(chunk: Buffer) {
        this.dataCount++;
        // 如果是第一次接收数据，处理连接信息
        if (this.dataCount === 1)
            return this.handleConnection(chunk);

        // 将数据放入帧缓存
        this.frames.push(chunk);
        this.emit('data');
    }

   /**
     * 处理连接信息的数据块。
     * @param data 连接信息的数据块
     */
    private handleConnection(data: Buffer) {
        // 将数据块转换为字符串并按行拆分
        const connectionHeader = data.toString('utf-8').split('\r\n');
        const protocol = connectionHeader[0];

        // 判断协议类型，进行相应处理
        if (protocol === 'HTTP/1.1 101 Switching Protocols') {
            this.status = 'connected';
            this.emit('connection'); // 触发连接成功事件
            console.log('websocket connected'); // 打印连接成功消息
            return;
        }

        // 如果协议是未授权的，关闭连接并抛出未授权错误
        if (protocol === 'HTTP/1.1 401 Unauthorized') {
            this.status = 'closed';
            this.socket.destroy(); // 销毁连接
            throw new Error('Unauthorized, Please check `appid` and `secret`'); // 抛出错误信息
        }

        // 如果协议无效，抛出错误
        throw new Error('Invalid protocol');
    }

    // 处理完整的帧
    private handleFrame(frame: Frame) {
        this.frameCount++;

        this.currentFrame = undefined;
        this.dataStatus = 'idle';

        console.log(this.frameCount, frame.toString()); // 记录帧数和帧内容
        return this.handleData();
    }

    /**
     * 处理当前帧的剩余数据块。
     * @param chunk 当前需要处理的数据块
     */
    private handleDataCurrentFrame(chunk: Buffer) {
        // 获取当前帧对象
        const frame = this.currentFrame!;

        // 获取当前帧已接收的字节数和负载长度
        const receivedLength = frame.receivedBytes;
        const payloadLength = frame.payloadLength;

        // 计算还需接收的字节数，以判断是否需要继续处理
        const payloadEnd = payloadLength - receivedLength;

        // 如果剩余的数据块长度小于还需接收的字节数，将数据块添加到当前帧
        if (payloadEnd > chunk.length)
            return frame.addChunk(chunk);

        // 否则，将剩余部分的数据块作为负载添加到当前帧
        const payload = chunk.subarray(0, payloadEnd);
        const remainderPayload = chunk.subarray(payloadEnd);

        frame.addChunk(payload);
        this.frames.unshift(remainderPayload);

        // 触发 'frame' 事件，表示当前帧处理完成
        this.emit('frame', frame);
    }

    /**
     * 处理接收到的数据块。
     * @param chunk 当前需要处理的数据块
     * @param pending 是否处于等待中的状态
     */
    private handleData(chunk?: Buffer, pending = false) {
        // 如果当前状态为等待中，并且不是在等待状态下被调用，则直接返回
        if (this.dataStatus === 'pending' && !pending)
            return;

        // 将状态设置为等待中，避免重复处理
        this.dataStatus = 'pending';

        // 如果没有提供数据块，从待处理的帧缓存中获取一个
        if (!chunk)
            chunk = this.frames.shift();

        // 如果没有数据块可处理，将状态设置为空闲并返回
        if (!chunk)
            return this.dataStatus = 'idle';

        // 如果正在处理当前帧，继续处理当前帧
        if (this.currentFrame)
            return this.handleDataCurrentFrame(chunk);

        // 如果数据块长度小于 2，尝试与下一个帧数据合并
        if (chunk.length < 2) {
            const next = this.frames.shift();
            if (!next) {
                this.frames.unshift(chunk);
                return this.dataStatus = 'idle';
            }

            chunk = Buffer.concat([chunk, next]);
        }

        // 解析数据块，获取操作码、负载长度等信息
        const [, opcode, payloadLength, , payload, remainderPayload] = resolveChunk(chunk);

        // 创建新的帧并设置当前帧为该帧
        const frame = this.currentFrame = new Frame(opcode, payloadLength);
        frame.addChunk(payload);

        // 如果有剩余的负载数据，将其放回帧缓存
        if (remainderPayload.length > 0)
            this.frames.unshift(remainderPayload);

        // 如果帧状态为完成，触发 'frame' 事件
        if (frame.status === 'finish')
            return this.emit('frame', frame);

        // 递归处理数据，确保处理完整个帧
        this.handleData(undefined, true);
    }


    // 发送消息
    sendMessage(message: string | object) {
        if (typeof message === 'object')
            message = JSON.stringify(message);

        const packet = new PacketMessage(message);
        this.socket.write(packet.toString());
    }

    // 创建 WebSocket 实例并连接
    static connect(options: net.NetConnectOpts, auth: { appid: number; secret: string; hostname: string }) {
        const socket = net.createConnection(options);

        return new WebSocket(socket, auth);
    }
}

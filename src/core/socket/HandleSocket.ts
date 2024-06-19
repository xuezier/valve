import { Socket } from 'net';
import { HandleChunk } from './HandleChunk';
import { PACKET_EMPTY, PACKET_FIN, PACKET_FIN_LEN } from './constants';
import { Trigger } from '../trigger/function/Trigger';
import { SOCKET_EVENTS, SOCKET_STATUS } from './type';

/**
 * 用于处理 Socket 连接的类。
 */
export class HandleSocket extends Trigger<SOCKET_EVENTS> {
    private chunks: Buffer[] = []; // 存储接收到的数据块
    private chunk?: HandleChunk; // 当前正在处理的数据块
    private status: SOCKET_STATUS = 'IDLE'; // Socket 连接的处理状态，默认为空闲状态

    /**
     * 构造函数，初始化 HandleSocket 实例。
     *
     * @param socket - 要处理的 Socket 实例。
     */
    constructor(private socket: Socket) {
        super();

        // 监听 'chunk-append' 事件，当数据块追加时触发处理
        this.on('chunk-append', this.handleChunkAppend.bind(this));
    }

    /**
     * 向 Socket 写入消息。
     *
     * @param message - 要写入的消息。
     */
    private write(message: string) {
        this.socket.write(`${message}${PACKET_FIN}`);
    }

    send(message: string | object) {
        if(typeof message === 'object')
            message = JSON.stringify(message);

        this.write(message);
    }

    /**
     * 处理数据块追加事件。
     */
    private handleChunkAppend() {
        if (this.status === 'CHUNK_PENDING')
            return; // 如果正在处理数据块，则不进行处理

        const chunk = this.chunks.shift();
        if (!chunk)
            return this.status = 'IDLE'; // 如果没有数据块需要处理，设置为空闲状态

        this.status = 'CHUNK_PENDING'; // 设置为正在处理数据块状态
        return this.handleData(chunk);
    }

    /**
     * 处理数据块。
     *
     * @param chunk - 要处理的数据块。
     */
    private handleData(chunk: Buffer) {
        if (this.chunk) {
            const offset = chunk.indexOf(PACKET_FIN);
            if (offset === -1) {
                this.chunk.append(chunk); // 如果没有结束标志，则追加到当前数据块中
            } else {
                this.chunk.append(chunk.subarray(0, offset + PACKET_FIN_LEN)); // 追加到当前数据块中
                this.emit('chunk-ready', this.chunk); // 触发 'chunk-ready' 事件，表示数据块已准备好
                this.chunk = undefined;

                chunk = chunk.subarray(offset + PACKET_FIN_LEN);
                if (chunk.length)
                    return this.handleData(chunk); // 处理剩余部分
                else {
                    this.status = 'IDLE'; // 设置为空闲状态
                    this.emit('chunk-append'); // 触发 'chunk-append' 事件，表示可以追加新数据块
                }
            }
        } else {
            this.chunk = new HandleChunk(PACKET_EMPTY); // 创建新的数据块实例
            return this.handleData(chunk); // 继续处理数据块
        }
    }

    /**
     * 加载处理 Socket 数据的逻辑。
     */
    load() {
        this.socket.on('data', chunk => {
            this.chunks.push(chunk); // 将接收到的数据块加入待处理数组
            this.emit('chunk-append'); // 触发 'chunk-append' 事件，表示数据块可追加处理
        });
    }
}

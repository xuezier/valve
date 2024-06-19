import { PACKET_FIN } from "./constants";
import { CHUNK_TYPES } from "./type";

/**
 * 用于处理数据块的类。
 */
export class HandleChunk {
    status: CHUNK_TYPES = 'PENDING'; // 数据块的处理状态，默认为待处理
    private chunk: Buffer = Buffer.alloc(0); // 存储已拼接的数据块
    private chunks: Buffer[] = []; // 存储已接收但尚未拼接的数据块数组

    /**
     * 构造函数，初始化 HandleChunk 实例。
     *
     * @param chunk - 初始数据块。
     */
    constructor(chunk: Buffer) {
        this.append(chunk);
    }

    /**
     * 将新的数据块添加到待处理数据块列表中。
     *
     * @param chunk - 新的数据块。
     */
    append(chunk: Buffer) {
        if (this.status === 'OK') {
            return; // 如果已经处理完成，不再添加数据块
        }

        this.chunks.push(chunk); // 将新数据块添加到待处理数组

        // 检查数据块中是否包含结束标志
        if (chunk.indexOf(PACKET_FIN) !== -1) {
            this.status = 'OK'; // 设置状态为已处理
            this.chunk = Buffer.concat(this.chunks); // 拼接数据块数组为一个完整的数据块
        }
    }

    toBuffer() {
        return this.chunk;
    }

    /**
     * 将数据块转换为字符串。
     *
     * @returns 转换后的字符串。
     */
    toString() {
        return this.chunk.subarray(0, -1).toString('utf-8');
    }

    /**
     * 将数据块解析为 JSON 对象。
     *
     * @returns 解析后的 JSON 对象。
     */
    toJSON() {
        return JSON.parse(this.toString());
    }

    /**
     * 获取已拼接数据块的长度。
     *
     * @returns 数据块长度。
     */
    get length() {
        return this.chunk.length;
    }
}

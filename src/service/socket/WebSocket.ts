import * as net from 'net';
import { Socket } from "net";
import { Trigger } from "../../core/trigger/function/Trigger";
import { EWebSocket } from "./event/EWebSocket";
import { connect } from './websocket/handler/connect';
import { Frame } from './websocket/Frame';
import { resolveChunk } from './websocket/handler/resolveChunk';
import { PacketMessage } from './websocket/packet/PacketMessage';

type STATUS = 'connecting' | 'connected' | 'closing' | 'closed';
type DATA_STATUS = 'pending' | 'idle';

export class WebSocket extends Trigger<EWebSocket> {
    status: STATUS = 'connecting';
    private dataCount = 0;
    private frameCount = 0;

    private dataStatus: DATA_STATUS = 'idle';
    private currentFrame?: Frame;
    private frames: Buffer[] = [];

    constructor(private socket: Socket) {
        super();

        this.socket.on('data', this.handleSocketData.bind(this));

        this.on('data', this.handleData.bind(this));
        this.on('frame', this.handleFrame.bind(this));

        connect(socket);
    }

    private handleSocketData(chunk: Buffer) {
        this.dataCount++;
        if(this.dataCount === 1)
            return this.handleConnection(chunk);

        this.frames.push(chunk);
        this.emit('data');
    }

    private handleConnection(data: Buffer) {
        const connectionHeader = data.toString('utf-8').split('\r\n');
        const protocol = connectionHeader[0];
        if(protocol === 'HTTP/1.1 101 Switching Protocols') {
            this.status = 'connected';
            this.emit('connection');
            console.log('websocket connected');
            return;
        }

        throw new Error('Invalid protocol');
    }

    private handleFrame(frame: Frame) {
        this.frameCount++;

        this.currentFrame = undefined;
        this.dataStatus = 'idle';

        console.log(this.frameCount, frame.toString());
        return this.handleData();
    }

    private handleDataCurrentFrame(chunk: Buffer) {
        const frame = this.currentFrame!;

        const receivedLength = frame.receivedBytes;
        const payloadLength = frame.payloadLength;

        const payloadEnd = payloadLength - receivedLength;
        if(payloadEnd > chunk.length)
            return frame.addChunk(chunk);

        const payload = chunk.subarray(0, payloadEnd);
        const remainderPayload = chunk.subarray(payloadEnd);

        frame.addChunk(payload);
        this.frames.unshift(remainderPayload);

        this.emit('frame', frame);
    }

    private handleData(chunk?: Buffer, pending = false) {
        if(this.dataStatus === 'pending' && !pending)
            return;

        this.dataStatus = 'pending';
        if(!chunk)
            chunk = this.frames.shift();

        if(!chunk)
            return this.dataStatus = 'idle';

        if(this.currentFrame)
            return this.handleDataCurrentFrame(chunk);

        if(chunk.length < 2) {
            const next = this.frames.shift();
            if(!next) {
                this.frames.unshift(chunk);
                return this.dataStatus = 'idle';
            }

            chunk = Buffer.concat([chunk, next]);
        }

        const [, opcode, payloadLength, , payload, remainderPayload] = resolveChunk(chunk);
        const frame = this.currentFrame = new Frame(opcode, payloadLength);
        frame.addChunk(payload);

        if(remainderPayload.length > 0)
            this.frames.unshift(remainderPayload);

        if(frame.status === 'finish')
            return this.emit('frame', frame);

        this.handleData(undefined, true);
    }

    sendMessage(message: string | object) {
        if(typeof message === 'object')
            message = JSON.stringify(message);

        const packet = new PacketMessage(message);
        // return packet
        this.socket.write(packet.toString());
    }

    static connect(options: net.NetConnectOpts) {
        const socket = net.createConnection(options);

        return new WebSocket(socket);
    }
}
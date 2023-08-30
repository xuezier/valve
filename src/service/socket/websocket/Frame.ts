import { Trigger } from "../../../core/trigger/function/Trigger";
import { FrameType } from "./constants/FrameType";

type FrameEvents = 'finish' | 'data';
type FrameStatus = 'finish' | 'pending';

export class Frame extends Trigger<FrameEvents> {
    status: FrameStatus = 'pending';
    private data: Buffer[] = [];
    private _receivedBytes = 0;

    get receivedBytes() {
        return this._receivedBytes;
    }

    constructor(private _type: FrameType, private _payloadLength: number) {
        super();
    }

    get type() {
        return this._type;
    }

    get payloadLength() {
        return this._payloadLength;
    }

    addChunk(chunk: Buffer) {
        this.data.push(chunk);
        this._receivedBytes += chunk.length;
        this.emit('data', chunk);

        if(this.receivedBytes === this.payloadLength) {
            this.status = 'finish';
            this.emit('finish');
        }
    }

    toString() {
        const buffered = Buffer.concat(this.data);
        if(this.type === FrameType.BINARY)
            return buffered;

        return buffered.toString('utf-8');
    }
}
import { HandleChunk } from "../../core/socket/HandleChunk";
import { HandleSocket } from "../../core/socket/HandleSocket";

export class ClientSocket extends HandleSocket {
    load() {
        super.load();

        this.on('chunk-ready', (chunk: HandleChunk) => {
            console.log(chunk.toString())
        });
    }
}
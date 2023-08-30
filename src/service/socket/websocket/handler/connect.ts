import { Socket } from "net";

export function connect(socket: Socket) {
    const request = [
        'GET / HTTP/1.1',
        'Host: example.com',
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==',
        'Sec-WebSocket-Version: 13',
        '',
        ''
    ].join('\r\n');

    socket.write(request);
}
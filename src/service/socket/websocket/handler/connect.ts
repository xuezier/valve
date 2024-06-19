import { Socket } from "net";

export function connect(socket: Socket, auth: { appid: number; secret: string; hostname: string }) {
    const { appid, secret, hostname } = auth;

    const request = [
        'GET / HTTP/1.1',
        'Host: example.com',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Authorization: Basic ${Buffer.from(`${appid}:${secret}:${hostname}`).toString('base64')}`,
        'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==',
        'Sec-WebSocket-Version: 13',
        '',
        ''
    ].join('\r\n');

    socket.write(request);
}
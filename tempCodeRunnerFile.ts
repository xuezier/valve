var http2 = require('http2');

http2.createServer((req, res) => {
    console.log(req)
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    res.end('hello');
}).listen(3002, '127.0.0.1');
const { Server } = require('socket.io');

module.exports = (server, app) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000'
        }
    });
    app.set('io', io);
    const solver = io.of('/solver');
    const loader = io.of('/loader');

    solver.on('connection', (socket) => {
        console.log('solver 네임스페이스 접속');
        socket.on('disconnect', () => {
            console.log('solver 네임스페이스 접속 해제');
        });
    });

    loader.on('connection', (socket) => {
        console.log('loader 네임스페이스 접속');
        socket.on('disconnect', () => {
            console.log('loader 네임스페이스 해제');
        });
    });

    io.on('connection', (socket) => {
        const req = socket.request;
        console.log('새로운 클라이언트 접속!', socket.id, req.ip);
        socket.on('disconnect', () => {
            console.log('클라이언트 접속 해제', req.ip, socket.id);
        });
        socket.on('error', (error) => {
            console.error(error);
        });
        socket.on('reply', (data) => {
            console.log(data);
        });
        socket.interval = setInterval(() => {
            socket.emit('news', 'Hello Socket.IO');
        }, 3000);
    });
};
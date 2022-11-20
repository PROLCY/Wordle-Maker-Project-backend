const { Server } = require('socket.io');

module.exports = (server, app) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000'
        }
    });
    app.set('io', io);
    const loader = io.of('/loader');

    loader.on('connection', (socket) => {
        console.log('loader 네임스페이스 접속');
        const maker = socket.handshake.query.maker;
        console.log(maker);
        socket.join(maker);

        socket.on('typing', (data) => {
            console.log('typing');
            socket.to(data.room).emit('typing', data.info);
        });
        //req.app.get('io').of('/loader').to(req.params.maker).emit('enter', await getSolvers(req.params.maker));

        socket.on('disconnect', () => {
            console.log('loader 네임스페이스 해제');
            socket.leave(maker);
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
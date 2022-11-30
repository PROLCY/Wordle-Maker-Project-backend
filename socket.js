const { Server } = require('socket.io');

module.exports = (server, app) => {
    const io = new Server(server, {});
    app.set('io', io);
    const loader = io.of('/loader');

    loader.on('connection', (socket) => {
        console.log('loader 네임스페이스 접속');
        const maker = socket.handshake.query.maker;
        console.log('room name: ', maker);
        socket.join(maker);

        socket.on('disconnect', () => {
            console.log('loader 네임스페이스 해제');
            socket.leave(maker);
        });
    });
};
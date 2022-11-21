const { Server } = require('socket.io');
const { addSolver } = require('./function');

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
        console.log('makerNickname: ', maker);
        socket.join(maker);

        socket.on('typing', async (data) => {
            console.log('typing');
            socket.to(data.room).emit('typing', await addSolver(data.room, data.info));
        });

        socket.on('disconnect', () => {
            console.log('loader 네임스페이스 해제');
            socket.leave(maker);
        });
    });
};
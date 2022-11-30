const { Maker, Solver} = require("./models");

exports.getSolvers = async function  ( makerNickname ) { // makerNickname에 해당하는 모든 solvers 배열 반환
    const maker = await Maker.findOne({
        where: {
            nickname: makerNickname,
        },
        include: [{
            model: Solver,
            attributes: ['nickname', 'word_list'],
        }]
    });
    const solvers = maker.Solvers.map(
        solver => ({
            nickname: [solver.nickname.split('').map(nickname => ({
                text: nickname,
                state: 'filled',
            }))],
            wordList: solver.word_list === null ? [] : JSON.parse(solver.word_list),
        }));
    return solvers;
};
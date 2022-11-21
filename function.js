const { Maker, Solver} = require("./models");

exports.getSolvers = async function  ( makerNickname ) {
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

exports.addSolver = async function ( makerNickname, data ) {
    let  solvers = await module.exports.getSolvers(makerNickname);
    const solver = solvers.find(solver => 
        solver.nickname[0].map(info => info.text).join('') === data.nickname
    );
    const solverIndex = solvers.indexOf(solver);
    if ( solver.wordList.length === data.listIndex )
        solver.wordList.push(data.word);
    else 
        solver.wordList.splice(data.listIndex, 1, data.word);
    solvers[solverIndex] = solver;
    return solvers;
};
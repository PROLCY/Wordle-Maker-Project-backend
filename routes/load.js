const express = require('express');
const axios = require('axios');
const Word = require('../schemas/word');
const { Maker, Solver } = require('../models');

const router = express.Router();

const getSolvers = async ( makerNickname ) => {
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

router.get('/', async (req, res) => {
    try {
        if ( !req.session.maker ) {
            res.send('no-session');
            return;
        }
        res.send(await getSolvers(req.session.maker));
    } catch (error) {
        console.error(error);
    }
});

router.post('/', async (req, res) => {
    try {
        req.session.maker = req.body.makerNickname;
        res.send(await getSolvers(req.body.makerNickname));
    } catch (error) {
        console.error(error);
    }
})

router.post('/exist', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        const maker = await Maker.findOne({
            where: {
                nickname: nickname
            }
        });
        if( maker === null )
            res.send(false);
        else
            res.send(true);
    } catch (error) {
        console.error(error);
    }
});


module.exports = router;

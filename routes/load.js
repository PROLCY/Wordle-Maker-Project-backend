const express = require('express');
const axios = require('axios');
const Word = require('../schemas/word');
const { Maker, Solver } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const maker = await Maker.findOne({
            attributes: ['correct_word'],
            where: {
                nickname: 'AAAAA',
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
            }))
        res.send(solvers);
    } catch (error) {
        console.error(error);
    }
});

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

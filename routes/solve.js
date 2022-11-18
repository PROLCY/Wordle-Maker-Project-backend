const express = require('express');
const axios = require('axios');
const Word = require('../schemas/word');
const { Maker, Solver } = require('../models');
const { getSolvers } = require('../function');

const router = express.Router();

router.get('/:maker', async (req, res) => {
    try {
        console.log(req.session);
        if ( req.session.solver === undefined || !req.session.solver[req.params.maker] ) {
            res.send('no-session');
            return;
        }
        const maker = await Maker.findOne({
            attributes: ['correct_word'],
            where: {
                nickname: req.params.maker,
            },
            include: [{
                model: Solver,
                attributes: ['word_list', 'key_state'],
                where: {
                    nickname: req.session.solver[req.params.maker],
                }
            }],
        });
        let word_list = maker.Solvers[0].word_list;
        let key_state = maker.Solvers[0].key_state;
        if ( word_list === null )
            word_list = '[]';
        if ( key_state === null )
            key_state = '{}';

        console.log("correct_word:", maker.correct_word, "word_list", word_list);
        res.send({
            wordCorrect: maker.correct_word,
            wordList: JSON.parse(word_list),
            keyState: JSON.parse(key_state),
        });
    } catch (error) {
        console.error(error);
    }
});

router.post('/:maker/duplicated', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        const sovler = await Solver.findOne({
            where: {
                nickname: nickname,
                maker: req.params.maker,
            }
        });
        if( sovler === null )
            res.send('not-duplicated');
        else
            res.send("duplicated");
    } catch (error) {
        console.error(error);
    }
});

router.post('/:maker/register', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        console.log(nickname, req.params.maker);

        const maker = await Maker.findOne({
            attributes: ['correct_word'],
            where: {
                nickname: req.params.maker,
            }
        });

        const solver = await Solver.create({
            nickname: nickname,
            maker: req.params.maker,
        });

        await maker.addSolver(solver);

        if ( req.session.solver === undefined )
            req.session.solver = {};
        req.session.solver [req.params.maker]= nickname;
        console.log('session saved', req.session.solver[req.params.maker]);

        res.send({
            wordCorrect: maker.correct_word
        });
    } catch (error) {
        console.error(error);
    }
});

router.post('/:maker/add', async (req, res) => {
    // solver 테이블에 등록
    const solver = await Solver.findOne({
        attributes: ['word_list', 'key_state'],
        where: {
            nickname: req.session.solver[req.params.maker],
            maker: req.params.maker,
        }
    });
    let word_list = JSON.parse(solver.word_list);
    let key_state = JSON.parse(solver.key_state);
    if ( word_list === null )
        word_list = [];
    word_list.push(req.body.newWord);
    key_state = req.body.keyState;

    
    word_list = JSON.stringify(word_list);
    key_state = JSON.stringify(key_state);
    await Solver.update({
        word_list: word_list,
        key_state: key_state,
    }, {
        where: {
            nickname: req.session.solver[req.params.maker],
            maker: req.params.maker,
        }
    });
    req.app.get('io').of('/loader').to(req.params.maker).emit('enter', await getSolvers(req.params.maker));

    console.log(word_list, key_state);
    res.end();
});

router.post('/exist', async (req, res) => {
    try {
        const wordFound = await Word.find({ word: req.body.word });
        
        if ( !wordFound.length )
            res.send({
                exist: false
            })
        else {
            res.send({
                exist: true
            })
        }
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;


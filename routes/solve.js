const express = require('express');
const Word = require('../schemas/word');
const { Maker, Solver } = require('../models');
const { getSolvers } = require('../function');

const router = express.Router();

router.get('/:maker', async (req, res) => {
    try {
        console.log(req.session);
        const maker = await Maker.findOne({
            where: {
                nickname: req.params.maker,
            },
        });
        if ( maker === null ) {
            if ( req.session.solver !== undefined ) {
                req.session.solver[req.params.maker] = null;
            }
            res.send("Not Found");
            return;
        }
        if ( req.session.solver === undefined || !req.session.solver[req.params.maker] ) {
            res.send('no-session');
            return;
        }
        const solvers = await maker.getSolvers({
            attributes: ['word_list', 'key_state'],
            where: {
                nickname: req.session.solver[req.params.maker],
            }
        });
        let word_list = solvers[0].word_list;
        let key_state = solvers[0].key_state;

        word_list = JSON.parse(word_list);
        key_state = JSON.parse(key_state);

        if ( word_list === null )
            word_list = [[]];
        if ( key_state === null )
            key_state = {};

        let last_word, listIndex;

        console.log("word_list", word_list);
        console.log("word_list.length:", word_list.length);
        console.log("element:", word_list[word_list.length - 1]);
        
        if ( word_list[word_list.length - 1].length === 0) {
            listIndex = word_list.length - 1;
            last_word = [];
        }
        else if ( word_list[word_list.length - 1][0].state === 'filled' ) {
            listIndex = word_list.length - 1;
            last_word = word_list[word_list.length - 1];
        }
        else {
            listIndex = word_list.length;
            last_word = [];
        }

        console.log("last_word:", last_word);

        console.log("correct_word:", maker.correct_word, "word_list", word_list);
        res.send({
            wordCorrect: maker.correct_word,
            wordList: word_list,
            keyState: key_state,
            lastWord: last_word,
            nickname: req.session.solver[req.params.maker],
            listIndex: listIndex,
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

        req.app.get('io').of('/loader').to(req.params.maker).emit('enter', await getSolvers(req.params.maker));

        res.send({
            wordCorrect: maker.correct_word
        });
    } catch (error) {
        console.error(error);
    }
});

router.post('/:maker/enter', async (req, res) => {
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
    word_list.splice(word_list.length - 1, 1, req.body.newWord);
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

router.post('/:maker/typing', async (req, res) => {
    // solver 테이블에 등록
    const solver = await Solver.findOne({
        attributes: ['word_list'],
        where: {
            nickname: req.session.solver[req.params.maker],
            maker: req.params.maker,
        }
    });
    let word_list = JSON.parse(solver.word_list);
    console.log(req.body.newWord, req.body.listIndex);
    if ( word_list === null )
        word_list = [];
    console.log(word_list.length);
    if ( word_list.length === req.body.listIndex )
        word_list.push(req.body.newWord);
    else if ( word_list.length > req.body.listIndex)
        word_list.splice(req.body.listIndex, 1, req.body.newWord);

    word_list = JSON.stringify(word_list);

    await Solver.update({
        word_list: word_list,
    }, {
        where: {
            nickname: req.session.solver[req.params.maker],
            maker: req.params.maker,
        }
    });

    req.app.get('io').of('/loader').to(req.params.maker).emit('enter', await getSolvers(req.params.maker));

    console.log(word_list);
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


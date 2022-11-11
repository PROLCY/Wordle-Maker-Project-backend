const express = require('express');
const axios = require('axios');
const Word = require('../schemas/word');
const { Maker, Solver, Url } = require('../models');

let wordList = [];
let keyState = {};
let wordCorrect;

const router = express.Router();

router.get('/:maker', async (req, res) => {
    try {
        console.log(req.session);
        const maker = await Maker.findOne({
            attributes: ['id'],
            where: {
                nickname: req.params.maker,
            }
        });
        const url = await Url.findOne({
            attributes: ['id', 'correct_word'],
            where: {
                maker: maker.id,
            }
        });
        if ( req.session.solver === undefined || !req.session.solver[url.id] ) {
            res.send('no-session');
            return;
        }
        const solver = await Solver.findOne({
            attributes: ['word_list'],
            where: {
                nickname: req.session.solver[url.id],
            }
        });
        console.log("correct_word:", url.correct_word, "word_list", solver.word_list);
        res.send({
            wordCorrect: url.correct_word,
            //wordList: solver.word_list,
        });
    } catch (error) {
        console.error(error);
    }
});

router.post('/duplicated', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        const sovler = await Solver.findOne({
            where: {
                nickname: nickname
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

router.post('/register', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        console.log(nickname, req.body.url);

        const url = await Url.findOne({
            attributes: ['id'],
            where: {
                url: req.body.url
            }
        })
        const solver = await Solver.create({
            nickname: nickname,
            url: url.id,
        });

        if ( req.session.solver === undefined )
            req.session.solver = [];
        req.session.solver [url.id]= nickname;
        console.log('session saved', req.session.solver[url.id]);

        res.end();
    } catch (error) {
        console.error(error);
    }
});

router.get('/:maker/correct', async (req, res) => {
    const url = await Url.findOne({
        attributes: ['correct_word', 'id'],
        where: {
            url: `http://localhost:3000/solve/${req.params.maker}`
        }
    })
    res.send({
        wordCorrect: url.correct_word,
        /*wordList: url.wordList,
        keyState: keyState*/
    });
});

router.post('/add', async (req, res) => {
    // solver 테이블에 등록
    keyState = req.body.keyState;
    
    res.status(200);
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


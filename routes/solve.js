const express = require('express');
const axios = require('axios');
const Word = require('../schemas/word');
const { Solver, Url } = require('../models');

let wordList = [];
let keyState = {};
let wordCorrect;

const router = express.Router();

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
        res.status(200);
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

router.post('/add', (req, res) => {
    // solver 테이블에 등록
    const newWord = req.body.newWord;
    keyState = req.body.keyState;
    wordList.push(newWord);
    console.log(wordList);
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


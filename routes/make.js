const express = require('express');
const axios = require('axios');
const Word = require('../schemas/word');
const { Maker, Url } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        if ( !req.session.maker ) {
            res.send('no-session');
            return;
        }
        const maker = await Maker.findOne({
            attributes: ['id'],
            where: {
                nickname: req.session.maker,
            }
        });
        const url = await Url.findOne({
            attributes: ['url', 'correct_word'],
            where: {
                maker: maker.id,
            }
        });
        res.send({
            url: url.url,
            correct_word: url.correct_word,
        });
    } catch (error) {
        console.error(error);
    }
});

router.post('/duplicated', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        const maker = await Maker.findOne({
            where: {
                nickname: nickname
            }
        });
        if( maker === null )
            res.send('not-duplicated');
        else
            res.send("duplicated");
    } catch (error) {
        console.error(error);
    }
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

router.post('/register', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        const correct_word = req.body.correct_word;
        console.log(nickname, correct_word);
        const URL = 'http://localhost:3000/solve/' + nickname;

        const maker = await Maker.create({
            nickname: nickname,
            url: URL,
        });
        const url = await Url.create({
            url: URL,
            correct_word: correct_word,
            maker: maker.id,
        });

        req.session.maker = nickname;
        console.log("session saved", req.session.maker);    

        res.send(URL);
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;

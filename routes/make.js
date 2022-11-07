const express = require('express');
const axios = require('axios');
const { Maker, Url } = require('../models');

const router = express.Router();

router.post('/duplicated', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        const maker = await Maker.findOne({
            where: {
                nickname: nickname
            }
        });
        if( maker == null )
            res.send('not-duplicated');
        else
            res.send("duplicated");
    } catch (error) {
        console.error(error);
    }
})

router.post('/register', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        const correct_word = req.body.correct_word;
        console.log(nickname, correct_word);
        const URL = 'http://localhost:3000/' + nickname + '/' + correct_word;

        const maker = await Maker.create({
            nickname: nickname,
            url: URL,
        });
        const url = await Url.create({
            url: URL,
            correct_word: correct_word,
            maker: maker.id,
        });
        res.send({
            url: URL,
        });
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
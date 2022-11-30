const express = require('express');
const Word = require('../schemas/word');
const { Maker } = require('../models');

const router = express.Router();

router.get('/init', async (req, res) => { // 페이지 렌더링 시 오는 요청 처리
    try {
        if ( !req.session.maker ) {
            res.send('no-session');
            return;
        }
        const maker = await Maker.findOne({
            attributes: ['url', 'correct_word'],
            where: {
                nickname: req.session.maker,
            }
        });
        res.send({
            url: maker.url,
            correct_word: maker.correct_word,
        });
    } catch (error) {
        console.error(error);
    }
});

router.post('/duplicated', async (req, res) => { // 닉네임 중복 판별 요청 처리
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

router.post('/exist', async (req, res) => { // 단어 존재 여부 검증 요청 처리
    try {
        const wordFound = await Word.find({ 
            word: req.body.word 
        });
        
        if ( !wordFound.length ) {
            res.send({
                exist: false
            })
        } else {
            res.send({
                exist: true
            })
        }
    } catch (error) {
        console.error(error);
    }
});

router.post('/register', async (req, res) => { // 닉네임과 정답 단어 등록 요청 처리, wordle URL 및 세션 생성
    try {
        const nickname = req.body.nickname;
        const correct_word = req.body.correct_word;
        const URL = req.protocol + '://' + req.get('host')+ '/solve/' + nickname;
        console.log("nickname: ", nickname, "correct_word:", correct_word, "URL: ", URL);

        const maker = await Maker.create({
            nickname: nickname,
            url: URL,
            correct_word: correct_word,
        });

        req.session.maker = nickname;
        console.log("session saved", req.session.maker); 

        res.send(URL);

    } catch (error) {
        console.error(error);
    }
});

module.exports = router;

const express = require('express');
const { Maker } = require('../models');
const { getSolvers } = require('../function');

const router = express.Router();

let doubleChecked = {};

router.get('/init', async (req, res) => { // 페이지 렌더링 시 세션 검증 요청 처리
    try {
        if ( !req.session.maker ) {
            res.send('no-session');
            return;
        }
        res.send({
            maker: req.session.maker,
        });
    } catch (error) {
        console.error(error);
    }
});

router.post('/init', async (req, res) => { // 페이지 렌더링 시 데이터 요청 처리
    try {
        req.session.maker = req.body.makerNickname;
        console.log(req.body.makerNickname);
        res.send(await getSolvers(req.body.makerNickname));
    } catch (error) {
        console.error(error);
    }
});

router.post('/exist', async (req, res) => { // 닉네임 존재 여부 검증 요청 처리
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

router.delete('/delete/:maker', async (req, res) => { // wordle 삭제 요청 처리
    try {
        if ( doubleChecked[req.params.maker] === undefined ) {
            doubleChecked[req.params.maker] = 1;
            setTimeout(() => {
                delete doubleChecked[req.params.maker];
            }, 3000);
            res.send('oneClick');
        } else if ( doubleChecked [req.params.maker] === 1 ) {
            req.session.maker = null;
            await Maker.destroy({
                where: {
                    nickname: req.params.maker,
                }
            });
            res.send('doubleClick');
        }
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
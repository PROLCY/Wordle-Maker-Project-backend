const express = require('express');
const axios = require('axios');
const Word = require('../schemas/word');
const { Maker, Solver } = require('../models');
const { getSolvers } = require('../function');

const router = express.Router();

let doubleChecked = {};

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
    try {
        req.session.maker = req.body.makerNickname;
        console.log(req.body.makerNickname);
        res.send(await getSolvers(req.body.makerNickname));
    } catch (error) {
        console.error(error);
    }
});

router.post('/exist', async (req, res) => {
    try {
        const nickname = req.body.nickname;
        console.log(nickname);
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

router.delete('/delete/:maker', async (req, res) => {
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
const express = require('express');
const axios = require('axios');
const Word = require('../schemas/word');

let wordList = [];
let keyState = {};
let wordCorrect;

const router = express.Router();

router.get('/correct', async (req, res) => {
    if ( !req.session.ip ) {

        req.session.save(function() {
            req.session.ip = req.ip;
            console.log(req.session.ip);    
        })

        let random = Math.floor(Math.random() * await Word.count());
        const randomWord = await Word.findOne({}).skip(random);
        wordCorrect = randomWord.word;
        console.log(wordCorrect);
    }
    res.send({
        wordCorrect: wordCorrect,
        wordList: wordList,
        keyState: keyState
    });
});

router.post('/add', (req, res) => {
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
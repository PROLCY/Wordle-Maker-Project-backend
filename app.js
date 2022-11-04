const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

const connect = require('./schemas');

dotenv.config();
const indexRouter = require('./routes');
const solveRouter = require('./routes/solve');
const makeRouter = require('./routes/make');
const app = express();
app.set('port', process.env.PORT || 4000);
connect();

app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'build')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: 'session-cookie',
}));

app.use('/', indexRouter);
app.use('/solve', solveRouter);
app.use('/make', makeRouter);

app.use((req, res, next) => {
    res.status(404).send('Not Found');
})

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});
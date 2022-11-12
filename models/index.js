const Sequelize = require('sequelize');
const Maker = require('./maker');
const Solver = require('./solver');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

db.Maker = Maker;
db.Solver = Solver;

Maker.init(sequelize);
Solver.init(sequelize);

Maker.associate(db);
Solver.associate(db);

module.exports = db;
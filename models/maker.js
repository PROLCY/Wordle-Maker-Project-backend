const Sequelize = require('sequelize');

module.exports = class Maker extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            nickname: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true,
            },
            url: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            correct_word: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Maker',
            tableName: 'makers',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) { // solver과 1 대 N 관계
        db.Maker.hasMany(db.Solver, { foreignKey: 'maker', sourceKey: 'nickname' });
    }
};
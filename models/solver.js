const Sequelize = require('sequelize');

module.exports = class Solver extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            nickname: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            word_list: {
                type: Sequelize.STRING(200),
                allowNull: true,
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
            modelName: 'Solver',
            tableName: 'solvers',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Solver.belongsTo(db.Url, { foreignKey: 'url', targetKey: 'id' });
    }
};
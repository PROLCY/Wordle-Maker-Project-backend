const Sequelize = require('sequelize');

module.exports = class Url extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            url: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            correct_word: {
                type: Sequelize.STRING(10),
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
            modelName: 'Url',
            tableName: 'urls',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Url.belongsTo(db.Maker, { foreignKey: 'maker', targetKey: 'id' });
        db.Url.hasMany(db.Solver, { foreignKey: 'url', sourceKey: 'id' });
    }
};

module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        content: {
            type: Sequelize.TEXT,
            defaultValue: ''
        }
    };

    return sequelize.define('content', oConf, {
        tableName: 'content',
        charset: 'utf8'
    });
};
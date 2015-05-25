
module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        subject: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        sender: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        receiver: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        content: {
            type: Sequelize.TEXT,
            defaultValue: ''
        },

        type: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        sendStatus: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    };

    return sequelize.define('mail', oConf, {
        tableName: 'mail',
        charset: 'utf8'
    });
};
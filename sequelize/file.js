
module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        bucket: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        qnKey: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        name: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        size: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        mimeType: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        suffix: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        format: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        type: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        dir: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        width: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        height: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        isDel: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    };

    return sequelize.define('file', oConf, {
        tableName: 'file',
        charset: 'utf8'
    });
};
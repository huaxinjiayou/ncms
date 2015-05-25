
module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        type: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        name: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        content: {
            type: Sequelize.TEXT,
            defaultValue: ''
        },

        sort: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        isPublish: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },

        isDel: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    };

    return sequelize.define('setting', oConf, {
        tableName: 'setting',
        charset: 'utf8'
    });
};
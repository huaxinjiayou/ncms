
module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        docId: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        title: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        content: {
            type: Sequelize.TEXT,
            defaultValue: ''
        },

        author: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        source: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        url: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        img: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        imgBak: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        imgSize: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        words: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        hasImg: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        isPublish: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },

        isOriginal: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        isDel: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    };

    return sequelize.define('joke', oConf, {
        tableName: 'joke',
        charset: 'utf8'
    });
};
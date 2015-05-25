
module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        title: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        pinyin: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        description: {
            type: Sequelize.TEXT,
            defaultValue: ''
        },

        cover: {
            type: Sequelize.STRING,
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

        rqCode: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        words: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        sort: {
            type: Sequelize.INTEGER,
            defaultValue: 0
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

    return sequelize.define('post', oConf, {
        tableName: 'post',
        charset: 'utf8'
    });
};
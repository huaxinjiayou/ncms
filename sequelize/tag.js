
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

        itemCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        sort: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        type: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        isEnd: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },

        isDel: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    };

    return sequelize.define('tag', oConf, {
        tableName: 'tag',
        charset: 'utf8'
    });
};
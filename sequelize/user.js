
module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        name: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        email: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        password: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        salt: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        code: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        codeTimestamp: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        isEmailVerify: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        isOauthVerify: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        isAdmin: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        isDel: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        nickname: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        avatar: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        description: {
            type: Sequelize.TEXT,
            defaultValue: ''
        },

        url: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        gender: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        birthday: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        score: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        qq: {
            type: Sequelize.STRING,
            defaultValue: ''
        }
    };

    return sequelize.define('user', oConf, {
        tableName: 'user',
        charset: 'utf8'
    });
};
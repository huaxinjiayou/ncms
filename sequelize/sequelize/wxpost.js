
/**
 * 微信公众号文章信息
 */

module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        mark: { // 标志
            type: Sequelize.STRING,
            defaultValue: ''
        },

        title: { // 标题
            type: Sequelize.STRING,
            defaultValue: ''
        },

        description: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        cover: { // 搜狗对应的 openID
            type: Sequelize.STRING,
            defaultValue: ''
        },

        qnCover: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        origContent: {
            type: Sequelize.TEXT,
            defaultValue: ''
        },

        mdContent: {
            type: Sequelize.TEXT,
            defaultValue: ''
        },

        url: {
            type: Sequelize.TEXT,
            defaultValue: ''
        },

        lastModified: {
            type: Sequelize.DATE
        },

        sourceName: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        isV: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        classId: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        isDel: { // 删除
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        isNew: { // 是否是新的文章
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    };

    return sequelize.define('wxpost', oConf, {
        tableName: 'wxpost',
        charset: 'utf8'
    });
};
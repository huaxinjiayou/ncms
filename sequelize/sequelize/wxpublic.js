
/**
 * 微信公众号信息
 */
module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        title: { // 标题
            type: Sequelize.STRING,
            defaultValue: ''
        },

        name: { // 名称
            type: Sequelize.STRING,
            defaultValue: ''
        },

        openId: { // 搜狗对应的 openID
            type: Sequelize.STRING,
            defaultValue: ''
        },

        lastCount: { // 上次服务器的数量
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        lastGathererAt: { // 上次获取的时间
            type: Sequelize.DATE
        },

        isDel: { // 删除
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    };

    return sequelize.define('wxpublic', oConf, {
        tableName: 'wxpublic',
        charset: 'utf8'
    });
};
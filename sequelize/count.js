
module.exports = function (sequelize, Sequelize) {
    var oConf = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },

        objType: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        objId: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        actionType: {
            type: Sequelize.STRING,
            defaultValue: ''
        },

        val: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    };

    return sequelize.define('count', oConf, {
        tableName: 'count',
        charset: 'utf8'
    });
};
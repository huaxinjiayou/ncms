
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

        isDel: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    };

    return sequelize.define('action', oConf, {
        tableName: 'action',
        charset: 'utf8'
    });
};
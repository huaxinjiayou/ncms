
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

        tagId: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        sort: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },

        isDel: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    };

    return sequelize.define('relation_tag', oConf, {
        tableName: 'relation_tag',
        charset: 'utf8'
    });
};
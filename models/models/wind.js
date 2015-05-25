
var util        = _require('util/util');
var sequelize   = require('sequelize');
var model       = sequelize.Model;

module.exports = {
    // 表方法
    create  : util.windPromise(model.prototype.create),
    update  : util.windPromise(model.prototype.update),
    find    : util.windPromise(model.prototype.find),
    findAll : util.windPromise(model.prototype.findAll),
    count   : util.windPromise(model.prototype.count),
    destroy : util.windPromise(model.prototype.destroy),

    // 数据库方法
    sync    : util.windPromise(sequelize.prototype.sync),
    query   : util.windPromise(sequelize.prototype.query)
}
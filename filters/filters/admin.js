
module.exports = eval(windAsync(fAdmin));

function fAdmin(req, res, next) {
    var that = this;
    var oUser = req.session.user;
    if (!oUser || !oUser.isAdmin) {
        that.render500('没有权限');
        return;
    }
    
    return next();
}

module.exports = eval(windAsync(fLogin));

function fLogin(req, res, next) {
    var that = this;
    var oUser = that.user;
    if (!oUser) {
        if (that.isAjax) {
            that.jsonErr('需要登录完成此操作');
        } else {
            that.alert('需要登录完成此操作');
            that.redirectLogin();
        }
        return;
    }

    next();
}
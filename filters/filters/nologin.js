
module.exports = eval(windAsync(fNoLogin));

function fNoLogin(req, res, next) {
    var that = this;
    var oUser = that.user;
    if (oUser) {
        if (that.isAjax) {
            that.jsonErr('您已经登录');
        } else {
            that.alert('您已经登录');
            that.redirect('/');
        }
        return;
    }

    next();
}
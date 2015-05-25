
module.exports = {
    get: eval(windAsync(fGetSignout))
}

function fGetSignout(req, res, next) {
    var that = this;
    that.logout();
    that.redirect();
}
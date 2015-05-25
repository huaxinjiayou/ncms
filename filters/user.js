
module.exports = eval(windAsync(fUser));
var string = _require('util/string');
var user = _require('services/user');

function fUser(req, res, next) {
    var oUser = req.session.user;
    if (oUser) {
        next();
        return;
    }

    var sCookie = req.cookies[nConf.auth.cookieName];
    if (!sCookie) {
        return next();
    }
    var sAuthToken = string.decrypt(sCookie, nConf.auth.secret);
    var aAuthInfo = sAuthToken.split('|');
    var sUid = aAuthInfo[0];
    
    oUser = $await(user.findById(sUid));
    if (!oUser || oUser.isDel) {
        return next();
    }

    req.session.user = oUser;
    return next();
}
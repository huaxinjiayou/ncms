
var _ = require('underscore');
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var string = _require('util/string');
var Service = clazz.create();
var oModel = _require('models/user');

clazz.mix(Service, Base, null, {
    initialize: fUserInitialize,

    register: eval(windAsync(fUserRegister)),
    login: eval(windAsync(fUserLogin)),
    existEmail: eval(windAsync(fUserExistEmail)),
    findByEmail: eval(windAsync(fUserFindByEmail)),
    findByCode: eval(windAsync(fUserFindByCode)),
    updatePassword: eval(windAsync(fUserUpdatePassword)),
    updateCode: eval(windAsync(fUserUpdateCode)),

    isPasswordRight: fUserIsPasswordRight,
    generateCode: fUserGenerateCode,
    fixEmail: fUserFixEmail,
    fixPassword: fUserFixPassword
});
module.exports = new Service(oModel);

function fUserInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fUserRegister(sEmail, sPassword) {
    var that = this;
    sEmail = that.fixEmail(sEmail);
    sPassword = that.fixPassword(sPassword);

    if (!sEmail || !sPassword) {
        return;
    }

    var bExist = $await(that.existEmail(sEmail));
    if (bExist) {
        return;
    }

    var oData = {
        email: sEmail,
        salt: string.random()
    };
    oData.password = string.md5(sPassword + oData.salt);
    oData.name = sEmail.split('@')[0];
    oData.nickname = oData.name;
    that.generateCode(oData);
    return $await(that.create(null, oData));
}

function fUserLogin(sEmail, sPassword) {
    var that = this;
    sEmail = that.fixEmail(sEmail);
    sPassword = that.fixPassword(sPassword);

    if (!sEmail || !sPassword) {
        return;
    }

    var bExist = $await(that.existEmail(sEmail));
    if (!bExist) {
        return;
    }

    var oUser = $await(that.findByEmail(sEmail));
    var sMd5Pwd = string.md5(sPassword + oUser.salt);
    return sMd5Pwd === oUser.password ? oUser : null;
}

function fUserExistEmail(sEmail) {
    var that = this;
    return $await(this.exist({email: sEmail}));
}

function fUserFindByEmail(sEmail) {
    var that = this;
    sEmail = that.fixEmail(sEmail);
    if (!sEmail) {
        return;
    }

    return $await(that.first({'email': sEmail}, true));
}

function fUserFindByCode(sCode) {
    var that = this;
    if (!sCode) {
        return;
    }

    var aUser = $await(that.find({code: sCode}, true));
    if (aUser.length === 0) {
        return;
    }

    var oRightUser;
    aUser.every(function (oUser) {
        try {
            var nTimestamp = +oUser.codeTimestamp || 0;
            var sUserCode = string.md5(oUser.email + nTimestamp) + string.md5(nTimestamp);
            if (sUserCode === sCode) {
                var nNow = new Date().getTime();
                if (nNow - nTimestamp > 86400000) {
                    return false;
                }
                oRightUser = oUser;
            }
        } catch (e) {}

        return true;
    });

    return oRightUser;
}

function fUserUpdatePassword(sEmail, sPassword) {
    var that = this;
    sEmail = that.fixEmail(sEmail);
    sPassword = that.fixPassword(sPassword);

    if (!sEmail || !sPassword) {
        return;
    }

    var bExist = $await(that.existEmail(sEmail));
    if (!bExist) {
        return;
    }

    var oUser = $await(that.findByEmail(sEmail));
    var oFilter = that.filter();
    oFilter.cond('id', oUser.id);
    oFilter.data('password', string.md5(sPassword + oUser.salt));
    $await(that.update(oFilter));
}

function fUserUpdateCode(sEmail) {
    var that = this;
    sEmail = that.fixEmail(sEmail);

    if (!sEmail) {
        return;
    }

    // 重新更新验证码，然后发送验证邮件
    var oUser = $await(that.findByEmail(sEmail));
    var oData = that.generateCode({email: sEmail});
    var oFilter = that.filter();
    oFilter.data(oData);
    oFilter.cond('id', oUser.id);
    $await(that.update(oFilter));
    _.extend(oUser, oData);
    return oUser;
}

function fUserIsPasswordRight(oUser, sPassword) {
    var sMd5Pwd = string.md5(sPassword + oUser.salt);
    return sMd5Pwd === oUser.password;
}

function fUserGenerateCode(oData) {
    var sTimestamp = new Date().getTime();
    oData.codeTimestamp = sTimestamp;
    oData.code = string.md5(oData.email + sTimestamp) + string.md5(sTimestamp);
    return oData;
}

function fUserFixEmail(sEmail) {
    sEmail = sEmail ? sEmail.trim() : '';
    return string.isEmail(sEmail) ? sEmail : '';
}

function fUserFixPassword(sPassword) {
    return sPassword ? sPassword.trim() : '';
}

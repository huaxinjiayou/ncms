
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var string = _require('util/string');
var Service = clazz.create();
var oModel = _require('models/mail');

clazz.mix(Service, Base, null, {
    initialize: fMailInitialize,

    statusType: {
        signup: 0,
        forgetPwd: 1
    },

    sendSignup: eval(windAsync(fMailSendSignUp)),
    sendForgetPwd: eval(windAsync(fMailSendForgetPwd))
});
module.exports = new Service(oModel);

function fMailInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fMailSendSignUp(oUser) {
    var that = this;
    if (!oUser || !oUser.email || !oUser.code) {
        return;
    }

    var sCodeUrl = 'http://' + nConf.site.domain + '/sign/check/' + oUser.code;
    var sEmailContent = '<p>hi #{name},</p>' +
        '<p>感谢您注册360读者网，只需要一步就可以完成注册啦，赶快点击下面的链接验证你的E-mail吧：</p>' +
        '<a href="#{url}" target="_blank">#{url}</a>' +
        '<p>如果链接无法点击，请完整拷贝到浏览器地址栏里直接访问</p>' +
        '<p>验证将会在24小时后失效，请尽快完成身份验证，否则需要重新进行验证。</p>' +
        '<p><br /></p>' +
        '<p>--</p>' +
        '<p>360读者网</p>' +
        '<p>http://www.360duzhe.com</p>' +
        '<p><br /></p>' +
        '<p>这封邮件由系统自动发出，请不要直接回复。</p>' +
        '<p>需要联系我们请发邮件到 help@360duzhe.com</p>';
    sEmailContent = string.execTpl(sEmailContent, {
        name: oUser.name || oUser.email.split('@')[0],
        url: sCodeUrl
    });

    $await(that.create(null, {
        receiver: oUser.email,
        subject: '验证登录邮箱 - 360读者网',
        content: sEmailContent,
        type: that.statusType.signup
    }));
}

function fMailSendForgetPwd(oUser) {
    var that = this;
    if (!oUser || !oUser.email || !oUser.code) {
        return;
    }

    var sCodeUrl = 'http://' + nConf.site.domain + '/sign/repwd/' + oUser.code;
    var sEmailContent = '<p>hi #{name},</p>' +
        '<p>只需要一步就可以修改您在 360读者 的账号登录密码啦，赶快点击下面的链接验证你的E-mail吧：</p>' +
        '<a href="#{url}" target="_blank">#{url}</a>' +
        '<p>如果链接无法点击，请完整拷贝到浏览器地址栏里直接访问</p>' +
        '<p>验证将会在24小时后失效，请尽快完成身份验证，否则需要重新进行验证。</p>' +
        '<p style="color:#c30;">如果修改密码操作并非由您本人申请，请忽略此操作。</p>' +
        '<p>--</p>' +
        '<p>360读者网</p>' +
        '<p>http://www.360duzhe.com</p>' +
        '<p><br /></p>' +
        '<p>这封邮件由系统自动发出，请不要直接回复。</p>' +
        '<p>需要联系我们请发邮件到 help@360duzhe.com</p>';
    sEmailContent = string.execTpl(sEmailContent, {
        name: oUser.name || oUser.email.split('@')[0],
        url: sCodeUrl
    });

    $await(that.create(null, {
        receiver: oUser.email,
        subject: '验证邮箱 - 360读者网',
        content: sEmailContent,
        type: that.statusType.forgetPwd
    }));
}




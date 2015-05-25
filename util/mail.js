
var nodemailer = require('nodemailer');
var string = _require('util/string');

module.exports = {
    send: eval(windAsync(fEmailSend))
};

/**
 * {
 *     to: String, 收件人
 *     subject: String, 主题
 *     content: String, 内容
 * }
 */
function fEmailSend(oParam) {
    if (!oParam.to || !oParam.subject) {
        return;
    }

    var that = this;
    var oMailConf = nConf.mail;
    var oSmtpTransport = nodemailer.createTransport('SMTP', {
        service: 'QQex',
        auth: {
            user: oMailConf.username,
            pass: oMailConf.password
        }
    });

    // 补充完全部信息
    var oMsg = {
        from: 'admin <' + oMailConf.username + '>',
        to: oParam.to,
        subject: oParam.subject,
        html: oParam.content,
        text: string.clearHtml(oParam.content)
    };

    var sendMailAsync = Wind.Async.Binding.fromStandard(oSmtpTransport.sendMail);
    var oResult = $await(sendMailAsync(oMsg));
    return oResult;
}
// 邮件发送服务

require('../env');

var mail = _require('services/mail');
var email = _require('util/mail');

module.exports = eval(windAsync(fSendMail));

function fSendMail() {
    var oFilter = mail.filter();
    oFilter.cond('sendStatus', 0);
    oFilter.order('createdAt asc');
    var oItem = $await(mail.first(oFilter));
    if (oItem) {
        try {
            $await(email.send({
                to: oItem.receiver,
                subject: oItem.subject,
                content: oItem.content
            }));

            oFilter = mail.filter();
            oFilter.data('sendStatus', 1);
            oFilter.cond('id', oItem.id);
            $await(mail.update(oFilter));
        } catch (e) {
            console.log(e);
            oFilter = mail.filter();
            oFilter.data('sendStatus', -1);
            oFilter.cond('id', oItem.id);
            $await(mail.update(oFilter));
        }
    }

    // 2.5 秒发一封
    $await(Wind.Async.sleep(2500));

    // 循环判断
    $await(module.exports());
}

module.exports().start();
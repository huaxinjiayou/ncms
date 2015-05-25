
module.exports = {
    filter: ['nologin'],
    get: eval(windAsync(fGetSignSended))
}

function fGetSignSended(req, res, next) {
    var that = this;
    that.render('site/sign/sended', {
        type: 'signup'
    });
}
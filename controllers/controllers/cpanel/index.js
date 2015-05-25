

module.exports = {
    filter: ['admin'],
    get: eval(windAsync(fGetIndex))
};

function fGetIndex(req, res, next) {
    var that = this;
    that.render('cpanel/index');
}
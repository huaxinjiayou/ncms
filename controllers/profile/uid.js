
module.exports = {
    route: '/profile/:uid',
    filter: ['checkuser'],
    get: eval(windAsync(fGetProfileUid))
};

function fGetProfileUid(req, res, next) {
    var that = this;
    that.redirect('/profile/' + that.params.uid + '/posts');
}
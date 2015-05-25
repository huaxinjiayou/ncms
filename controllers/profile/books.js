
var _ = require('underscore');
var book = _require('services/book');
var count = _require('services/count');
var action = _require('services/action');
var file = _require('services/file');
var util = _require('util/util');

module.exports = {
    route: '/profile/:uid/books',
    filter: ['checkuser', 'profiledata'],
    get: eval(windAsync(fGetProfileBooks))
};

function fGetProfileBooks(req, res, next) {
    var that = this;
    var oProfileData = that.profileData;
    var oProfileUser = oProfileData.user;
    that.setUpToken();

    // 书籍信息
    var nCurPage = util.id(that.query.page) || 0;
    var oFilter = book.filter();
    oFilter.order('createdAt desc, id desc');
    oFilter.cond('isEnd', true);
    oFilter.cond('parentId', null);
    oFilter.cond('userId', oProfileUser.id);
    !oProfileData.isSelf && oFilter.cond('isPublish', true);
    oFilter.page(nCurPage);
    var oBookData = $await(book.page(oFilter));
    var aCovers = $await(file.findCover(oBookData.data));


    // 其他信息
    var aIds = oBookData.data.map(function (oItem) {return oItem.id;});
    var oResult = $await(Task.whenAll({
        viewCounts: count.val(book.type, aIds, count.actionType.view),
        likeCounts: count.val(book.type, aIds, count.actionType.like),
        isLikes: action.isAction(that.user, book.type, aIds, count.actionType.like)
    }));

    res.render('site/profile/books', _.extend({}, oProfileData, {
        data: oBookData,
        covers: aCovers,
        viewCounts: oResult.viewCounts,
        likeCounts: oResult.likeCounts,
        isLikes: oResult.isLikes,
        type: 'book'
    }));
}
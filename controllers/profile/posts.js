
var _ = require('underscore');
var post = _require('services/post');
var count = _require('services/count');
var action = _require('services/action');
var util = _require('util/util');

module.exports = {
    route: '/profile/:uid/posts',
    filter: ['checkuser', 'profiledata'],
    get: eval(windAsync(fGetProfilePosts))
};

function fGetProfilePosts(req, res, next) {
    var that = this;
    var oProfileData = that.profileData;
    var oProfileUser = oProfileData.user;
    that.setUpToken();

    // 文章信息
    var nCurPage = util.id(that.query.page) || 0;
    var oFilter = post.filter();
    oFilter.order('createdAt desc, id desc');
    oFilter.include({book: 'id, title, pinyin'});
    oFilter.cond('userId', oProfileUser.id);
    !oProfileData.isSelf && oFilter.cond('isPublish', true);
    oFilter.page(nCurPage);
    var oPostData = $await(post.page(oFilter));

    // 其他信息
    var aIds = oPostData.data.map(function (oItem) {return oItem.id;});
    var oResult = $await(Task.whenAll({
        viewCounts: count.val(post.type, aIds, count.actionType.view),
        likeCounts: count.val(post.type, aIds, count.actionType.like),
        isLikes: action.isAction(that.user, post.type, aIds, count.actionType.like)
    }));

    res.render('site/profile/posts',  _.extend({}, oProfileData, {
        posts: oPostData,
        viewCounts: oResult.viewCounts,
        likeCounts: oResult.likeCounts,
        isLikes: oResult.isLikes
    }));
}
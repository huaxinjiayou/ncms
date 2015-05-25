
var _ = require('underscore');
var note = _require('services/note');
var count = _require('services/count');
var action = _require('services/action');
var file = _require('services/file');
var util = _require('util/util');

module.exports = {
    route: '/profile/:uid/notes',
    filter: ['checkuser', 'profiledata'],
    get: eval(windAsync(fGetProfileNotes))
};

function fGetProfileNotes(req, res, next) {
    var that = this;
    var oProfileData = that.profileData;
    var oProfileUser = oProfileData.user;
    that.setUpToken();

    // 书籍信息
    var nCurPage = util.id(that.query.page) || 0;
    var oFilter = note.filter();
    oFilter.order('createdAt desc, id desc');
    oFilter.cond('userId', oProfileUser.id);
    !oProfileData.isSelf && oFilter.cond('isPublish', true);
    oFilter.page(nCurPage);
    var oNoteData = $await(note.page(oFilter));
    var aCovers = $await(file.findCover(oNoteData.data));

    // 其他信息
    var aIds = oNoteData.data.map(function (oItem) {return oItem.id;});
    var oResult = $await(Task.whenAll({
        viewCounts: count.val(note.type, aIds, count.actionType.view),
        likeCounts: count.val(note.type, aIds, count.actionType.like),
        isLikes: action.isAction(that.user, note.type, aIds, count.actionType.like)
    }));

    res.render('site/profile/books',  _.extend({}, oProfileData, {
        data: oNoteData,
        covers: aCovers,
        viewCounts: oResult.viewCounts,
        likeCounts: oResult.likeCounts,
        isLikes: oResult.isLikes,
        type: 'note'
    }));
}
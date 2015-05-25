
var joke = _require('services/joke');
var count = _require('services/count');
var action = _require('services/action');
var util = _require('util/util');

module.exports = {
    route: '/qing-song-yi-ke.html',
    get: eval(windAsync(fGetQsyk))
};

function fGetQsyk(req, res, next) {
    var that = this;
    var oUser = that.user;
    var sUid = util.id(oUser);
    var sJid = util.id(that.query.jid);

    if (sJid) {
        var oJoke = $await(joke.findById(sJid));
        if (!oJoke) {
            that.render500('参数出错');
            return;
        }
        var oResult = $await(Task.whenAll({
            likeCount: count.val(joke.type, sJid, count.actionType.like),
            isLike: action.isAction(sUid, joke.type, sJid, action.actionType.like)
        }));

        that.render('site/index/qsykItem', {
            item: oJoke,
            likeCount: oResult.likeCount,
            isLike: oResult.isLike
        });
        return;
    }

    var nCurPage = util.id(that.query.page);
    var bOnlyTxt = that.query.txt === '1';
    var bOnlyImg = that.query.img === '1';

    if (bOnlyTxt && bOnlyImg) {
        bOnlyTxt = false;
        bOnlyImg = false;
    }

    var oFilter = joke.filter();
    if (bOnlyTxt) {
        oFilter.cond('hasImg', false);
    } else if (bOnlyImg) {
        oFilter.cond('hasImg', true);
    }
    oFilter.page(nCurPage, 48);
    oFilter.cond('isPublish', true);
    oFilter.order('createdAt desc, id desc');
    var oData = $await(joke.page(oFilter));
    var aIds = oData.data.map(function (oItem) {return oItem.id;});
    var oResult = $await(Task.whenAll({
        likeCounts: count.val(joke.type, aIds, count.actionType.like),
        isLikes: action.isAction(sUid, joke.type, aIds, action.actionType.like)
    }));
    that.render('site/index/qsyk', {
        data: oData,
        onlyTxt: bOnlyTxt,
        onlyImg: bOnlyImg,
        likeCounts: oResult.likeCounts,
        isLikes: oResult.isLikes
    });

}
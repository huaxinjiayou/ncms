
var util = _require('util/util');
var note = _require('services/note');
var relationpost = _require('services/relationpost');
var post = _require('services/post');

module.exports = {
    route: '/writer/note/:nid',
    filter: ['login'],
    get: eval(windAsync(fGetNoteItems))
};

function fGetNoteItems(req, res, next) {
    var that = this;
    var sNid = util.id(that.params.nid);
    var oNote = $await(note.findById(sNid));

    if (!that.hasPermission(oNote)) {
        return that.render500('不存在的专题');
    }

    // 查找子元素
    var aItems = $await(relationpost.findRelations(note.type, sNid, null, 'sort desc, updatedAt desc'));
    var aIds = [];
    var oPostRelationMap = {};
    aItems.forEach(function (oItem) {
        aIds.push(oItem.postId);
        oPostRelationMap[oItem.postId] = oItem.id;
    });
    aItems = $await(post.findById(aIds));
    aIds.length = 0;
    aItems.forEach(function (oItem) {
        aIds.push(oPostRelationMap[oItem.id]);
    });

    that.render('site/writer/note', {
        note: oNote,
        items: aItems,
        rpIds: aIds
    });
}
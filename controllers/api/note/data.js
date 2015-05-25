
var user = _require('services/user');
var note = _require('services/note');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    post: eval(windAsync(fPostNoteData))
}

function fPostNoteData(req, res, next) {
    var that = this;
    var sUid = util.id(that.user);
    var oFilter = note.filter();
    oFilter.cond('userId', sUid);
    oFilter.order('sort desc, createdAt desc');
    var aNotes = $await(note.find(oFilter));
    var aResult = aNotes.map(function (oItem) {
        return {
            id: oItem.id,
            title: oItem.title,
            itemCount: oItem.itemCount
        }
    });

    that.json(aResult);
}
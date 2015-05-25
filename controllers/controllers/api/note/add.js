
var user = _require('services/user');
var note = _require('services/note');
var relationpost = _require('services/relationpost');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    post: eval(windAsync(fPostNoteAdd))
}

function fPostNoteAdd(req, res, next) {
    var that = this;
    var sTitle = that.body.title;
    var sDescription = that.body.description;

    if (!sTitle) {
        sTitle = '无标题专题';
    }

    if (!sDescription) {
        sDescription = '';
    }

    var oNote = $await(note.create(that.user, {
        title: sTitle,
        description: sDescription,
        isPublish: true
    }));

    that.json({
        id: oNote.id,
        title: oNote.title,
        itemCount: oNote.itemCount
    });
}
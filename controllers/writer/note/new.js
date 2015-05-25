
var note = _require('services/note');
var uri = _require('frame/uri');

module.exports = {
    filter: ['login'],
    get: eval(windAsync(fGetNoteNew)),
    post: eval(windAsync(fPostNoteNew))
};

function fGetNoteNew(req, res, next) {
    var that = this;
    that.setUpToken();

    that.render('site/writer/noteform', {
        note: {},
        isEdit: false
    });
}

function fPostNoteNew(req, res, next) {
    var that = this;

    var sTitle = that.body.title;
    var sCover = that.body.cover;
    var sDescription = that.body.description;
    var bIsPublish = !!that.body.isPublish;
    var bRetain = !!that.body.retain;

    var oNote = $await(note.create(that.user, {
        title: sTitle,
        cover: sCover,
        description: sDescription,
        isPublish: bIsPublish
    }));

    that.alert('操作成功')
    if (bRetain) {
        that.redirect(uri.writerNote('new'));
    } else {
        that.redirect(uri.writerNote('index'));
    }
}
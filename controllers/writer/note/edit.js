
var util = _require('util/util');
var uri = _require('frame/uri');
var note = _require('services/note');
var file = _require('services/file');

module.exports = {
    route: '/writer/note/:nid/edit',
    filter: ['login'],
    get: eval(windAsync(fGetNoteEdit)),
    post: eval(windAsync(fPostNoteEdit))
};

function fGetNoteEdit(req, res, next) {
    var that = this;
    that.setUpToken();

    var sNid = util.id(that.params.nid);
    var oNote = $await(note.findById(sNid));
    if (!that.hasPermission(oNote)) {
        return that.render500('不存在的专题');
    }

    var oCover = $await(file.findCover(oNote));
    that.render('site/writer/noteform', {
        note: oNote,
        cover: oCover,
        isEdit: false
    });
}

function fPostNoteEdit(req, res, next) {
    var that = this;
    var sNid = util.id(that.params.nid);
    var oNote = $await(note.findById(sNid));
    if (!that.hasPermission(oNote)) {
        return that.render500('不存在的专题');
    }

    var sTitle = that.body.title;
    var sCover = that.body.cover;
    var sDescription = that.body.description;
    var bIsPublish = !!that.body.isPublish;

    var oFilter = note.filter();
    oFilter.data({
        title: sTitle,
        cover: sCover,
        description: sDescription,
        isPublish: bIsPublish
    });
    oFilter.cond('id', oNote.id);
    $await(note.update(oFilter));

    that.alert('操作成功');
    that.redirect(uri.writerNote('index', oNote));
}
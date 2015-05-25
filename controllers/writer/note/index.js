
var note = _require('services/note');

module.exports = {
    filter: ['login'],
    get: eval(windAsync(fGetNoteIndex))
};

function fGetNoteIndex(req, res, next) {
    var that = this;
    var oUser = that.user;

    var oFilter = note.filter();
    oFilter.order('sort asc, createdAt desc');
    oFilter.cond('userId', oUser.id);

    var notes = $await(note.find(oFilter));
    that.render('site/writer/notes.html', {
        notes: notes
    });
}
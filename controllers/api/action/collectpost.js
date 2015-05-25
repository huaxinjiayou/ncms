
var note = _require('services/note');
var post = _require('services/post');
var relationpost = _require('services/relationpost');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    post: eval(windAsync(fPostActionCollectPost))
}

function fPostActionCollectPost(req, res, next) {
    var that = this;
    var sPid = that.body.postid;
    var sNid = that.body.noteid;
    var bExistNote = $await(note.existById(sNid));
    var bExistPost = $await(post.existById(sPid));

    if (!bExistNote || !bExistPost) {
        return that.jsonErr('参数错误');
    }

    $await(relationpost.addPost(that.user, note.type, sNid, sPid));
    that.json();
}
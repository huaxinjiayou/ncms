
var joke = _require('services/joke');
var util = _require('util/util');

module.exports = {
    post: eval(windAsync(fAddJoke))
};

function fAddJoke(req, res, next) {
    var that = this;
    var sContent = that.body.content || '';
    if (!sContent || sContent.trim() === '') {
        return that.json();
    }

    $await(joke.create(that.user, {
        content: sContent,
        source: that.body.source,
        isPublish: false
    }));

    that.json();
}

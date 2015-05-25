
var joke = _require('services/joke');
var count = _require('services/count');
var action = _require('services/action');

module.exports = eval(windAsync(fOneJoke));

function fOneJoke(req, res, next) {
    var that = this;
    var oJoke = $await(joke.random());
    oJoke = oJoke || {};

    var oResult = $await(Task.whenAll({
        likeCount: count.val(joke.type, oJoke.id, count.actionType.like),
        isLike: action.isAction(that.user, joke.type, oJoke.id, action.actionType.like)
    }));
    oResult.joke = oJoke;
    res.locals.joke = oResult;
    next();
}
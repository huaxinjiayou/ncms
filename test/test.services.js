
// 载入 app 环境变量
require('../env');
var action = _require('services/action');
var count = _require('services/count');
var joke = _require('services/joke');
var tag = _require('services/tag');
var relationpost = _require('services/relationpost');
var relationtag = _require('services/relationtag');

// wrap 不能封装到类库中，不然会丢失上下文
function wrap(fCb) {
    return function (done) {
        eval(windAsync(fCb))(done).start();
    };
}

describe('services/action', function () {

    // it('action', wrap(function (done) {
    //     $await(action.action({id: 3}, 'book', '2', 'like'));
    //     $await(action.action({id: 3}, 'book', '2', 'like'));
    //     $await(action.action({id: 3}, 'book', '2', 'like'));
    //     done();
    // }));

    // it('isAction', wrap(function (done) {
    //     var bIsAction = $await(action.isAction({id: 3}, 'book', '2', 'like'));
    //     bIsAction.should.be.true;

    //     bIsAction = $await(action.isAction({id: 3}, 'book', '2', 'collect'));
    //     bIsAction.should.be.false;

    //     var aIsAction = $await(action.isAction({id: 3}, 'book', ['0', '1', '2', '3'], 'like'));
    //     aIsAction[0].should.be.false;
    //     aIsAction[1].should.be.false;
    //     aIsAction[2].should.be.true;
    //     aIsAction[3].should.be.false;
    //     done();
    // }));

    // it('cancel', wrap(function (done) {
    //     $await(action.cancel({id: 3}, 'book', '2', 'like'));
    //     $await(action.cancel({id: 3}, 'book', '5', 'like'));
    //     done();
    // }));

    // it('log', wrap(function (done) {
    //     $await(action.log({id: 3}, 'book', '5', 'like', 200000));
    //     $await(action.log({id: 3}, 'book', '5', 'like', 200000));
    //     done();
    // }));
    
    // it('user', wrap(function (done) {
    //     var aUser = $await(action.user('book', '5', 'like', 5, 'updatedAt desc'));
    //     console.log(aUser);
    //     done();
    // }));
    
});

describe('services/count', function () {
    // it('log', wrap(function (done) {
    //     $await(count.log('book', '5', 'like'));
    //     $await(count.log('book', '5', 'like'));
    //     $await(count.log('book', '5', 'like'));
    //     done();
    // }));

    // it('reduce', wrap(function (done) {
    //     $await(count.reduce('book', '5', 'like'));
    //     done();
    // }));

    // it('count', wrap(function (done) {
    //     var oResult = $await(count.count('book', '5', 'like'));
    //     console.log('======');
    //     console.log(oResult);

    //     var aResult = $await(count.count('book', ['5', '6'], 'like'));
    //     console.log('======');
    //     console.log(aResult);

    //     done();
    // }));

    // it('val', wrap(function (done) {
    //     var nResult = $await(count.val('book', '5', 'like'));
    //     console.log('======');
    //     console.log(nResult);

    //     var aResult = $await(count.val('book', ['5', '6'], 'like'));
    //     console.log('======');
    //     console.log(aResult);

    //     done();
    // }));
});

describe('services/joke', function () {
    // it('randomId', wrap(function (done) {
    //     var nId = $await(joke.randomId());
    //     console.log(nId);
    //     done();
    // }));

    // it('random', wrap(function (done) {
    //     var oJoke = $await(joke.random());
    //     console.log(oJoke);
    //     done();
    // }));
});

// describe('services/tag', function () {
//     it('recommend', wrap(function (done) {
//         var oTag = $await(tag.recommend());
//         console.log(oTag);
//         done();
//     }));
// });

describe('services/relationpost', function () {
    // it('addPost', wrap(function (done) {
    //     $await(relationpost.addPost({id: 3}, 'note', 1, 3));
    //     $await(relationpost.addPost({id: 3}, 'note', 1, 3));
    //     $await(relationpost.addPost({id: 3}, 'note', 1, 3));
    //     $await(relationpost.addPost({id: 3}, 'note', 1, 2));
    //     done();
    // }));
    
    // it('delPost', wrap(function (done) {
    //     $await(relationpost.delPost({id: 3}, 'note', 1, 3));
    //     $await(relationpost.delPost({id: 3}, 'note', 1, 3));
    //     $await(relationpost.delPost({id: 3}, 'note', 1, 3));
    //     $await(relationpost.delPost({id: 3}, 'abc', 1, 3));
    //     $await(relationpost.delPost({id: 3}, 'note', 1, 30));
    //     done();
    // }));
    
    // it('findRelations', wrap(function (done) {
    //     var aResult = $await(relationpost.findRelations('note', 1, 10));
    //     console.log(aResult);
    //     done();
    // }));

});

describe('services/relationtag', function () {
    // it('addTag', wrap(function (done) {
    //     var oTag = $await(tag.recommend());

    //     $await(relationtag.addTag('book', 7, oTag.id));
    //     $await(relationtag.addTag('book', 7, oTag.id));
    //     $await(relationtag.addTag('book', 7, oTag.id));
    //     $await(relationtag.addTag('book', 8, oTag.id));
    //     $await(relationtag.addTag('book', 9, oTag.id));
    //     done();
    // }));
    
    // it('removeTag', wrap(function (done) {
    //     var oTag = $await(tag.recommend());

    //     $await(relationtag.removeTag('book', 7, oTag.id));
    //     $await(relationtag.removeTag('book', 7, oTag.id));
    //     $await(relationtag.removeTag('book', 7, oTag.id));
    //     $await(relationtag.removeTag('book', 7, oTag.id));
    //     $await(relationtag.removeTag('book', 7, oTag.id));
        
    //     $await(relationtag.removeTag('book', 7));
    //     done();
    // }));
    
    // it('hasTag', wrap(function (done) {
    //     var oTag = $await(tag.recommend());
    //     var bHas;
    //     bHas = $await(relationtag.hasTag('book', 7, oTag.id));
    //     bHas.should.be.false;

    //     bHas = $await(relationtag.hasTag('book', 8, oTag.id));
    //     bHas.should.be.true;

    //     bHas = $await(relationtag.hasTag('book', 7, 100));
    //     bHas.should.be.false;

    //     aHas = $await(relationtag.hasTag('book', [7, 8, 9], oTag.id));
    //     console.log(aHas);

    //     done();
    // }));
    
    // it('findObj', wrap(function (done) {
    //     var oTag = $await(tag.recommend());
    //     $await(relationtag.findObj(oTag.id, 'book', 'createdAt desc', 10));
    // }));

});




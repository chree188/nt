"use strict";

var Video = function () {
    LocalContractStorage.defineMapProperty(this, "comments");
    LocalContractStorage.defineMapProperty(this, "scores");
};

Video.prototype = {
    init: function () {
    },
    postComment: function(vId, content){
        if(!vId || vId.length != 32){
            throw new Error('参数异常！');
        }
        if(!content || content.length == 0){
            throw new Error('评论内容不能为空！');
        }
        if(content.length > 200){
            throw new Error('评论内容不能超过200个字符！');
        }
        var from = Blockchain.transaction.from;
        var comments = this.comments.get(vId) || [];
        var comment = {
            'from': from,
            'content': content,
            'ts': new Date().getTime()
        }
        comments.push(comment);
        this.comments.put(vId, comments);
    },
    getComments: function (vId) {
        var comments = this.comments.get(vId) || [];
        return comments;
    },
    postScore: function (vId, score) {
        if(!vId || vId.length != 32){
            throw new Error('参数异常！');
        }
        if(score != 1 && score != 2 && score != 3 && score != 4 && score !=5){
            throw new Error('参数异常！');
        }
        var from = Blockchain.transaction.from;
        var scores = this.scores.get(vId) || [];
        var temp = [];
        for(var i=0;i<scores.length;i++){
            if(scores[i].from != from){
                temp.push(scores[i]);
            }
        }
        var scoreObj = {
            'from': from,
            'score': score
        }
        temp.push(scoreObj);
        this.scores.set(vId, temp);
    },
    getVideoScore: function(vId){
        var scores = this.scores.get(vId) || [];
        var total = 0;
        for(var i=0;i<scores.length;i++){
            total += scores[i].score;
        }
        var avg;
        if(scores.length == 0){
            avg = 0;
        }else{
            avg = total/scores.length;
        }
        return avg.toFixed(1);
    },
    getMyScore: function(vId, from){
        var scores = this.scores.get(vId) || [];
        for(var i=0;i<scores.length;i++){
            if(scores[i].from == from){
                return scores[i].score;
            }
        }
        return 0;
    }
};
module.exports = Video;
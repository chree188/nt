'use strict';
var SubjectItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.title = obj.title;
        this.comments = obj.comments;
    }
};

SubjectItem.prototype = {
    toString: function() {
        return JSON.stringify(this)
    }
};

var CommentItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.subjectId = obj.subjectId;
        this.content = obj.content;
        this.author = obj.author;
        this.time = obj.time;
    }
};

CommentItem.prototype = {
    toString: function() {
        return JSON.stringify(this)
    }
};

var BlockReview = function() {
    LocalContractStorage.defineProperty(this, "subjectSize");
    LocalContractStorage.defineMapProperty(this, "subjectData", {
        parse: function(text) {
            return new SubjectItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperty(this, "commentSize");
    LocalContractStorage.defineMapProperty(this, "commentData", {
        parse: function(text) {
            return new CommentItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

BlockReview.prototype = {
    init: function() {

    },

    save: function(subject, content) {

        var from = Blockchain.transaction.from;

        var subject_key = 'subject:' + subject;
        var subjectRec = this.subjectData.get(subject_key);

        if (subjectRec == null) {
            var subjectItem = new SubjectItem();
            var subjectId = this.subjectSize + 1;
            subjectItem.id = subjectId;
            subjectItem.title = subject;
            subjectItem.comments = new Array();

            this.subjectSize += 1;
            this.subjectData.set(subject_key, subjectItem);
        } else {
            var subjectItem = new SubjectItem(subjectRec);
            var subjectId = subjectItem.id;
        }

        var commentItem = new CommentItem();
        var commentId = this.commentSize + 1;
        commentItem.id = commentId;
        commentItem.subjectId = subjectId;
        commentItem.content = content;
        commentItem.author = from;
        var date = new Date();
        var time = date.getTime();
        commentItem.time = time;
        var comment_key = 'comment:' + commentId;

        this.commentSize += 1;
        this.commentData.set(comment_key, commentItem);
 
        subjectItem.comments.push(comment_key);
        this.subjectData.put(subject_key, subjectItem);

        var res = new Object();
        res.error = '0';
        res.msg = 'success';
        return JSON.stringify(res);
    },

    get: function(subject, page = '1', limit = '10') {
        var subject_key = 'subject:' + subject;
        var subjectRec = this.subjectData.get(subject_key);

        if (subjectRec == null) {
            var res = new Object();
            res.error = '1';
            res.msg = 'not found';
            return JSON.stringify(res);
        } else {
            var subjectItem = new SubjectItem(subjectRec);
            var commentIds = copyArr(subjectItem.comments);
            if (page < 0) {
                page = 1;
            }
            var offset = limit * (page - 1);
            if (commentIds.length > 0) {
                var commentItems = new Array();
                var commentIdsOffset = commentIds.splice(offset, limit);
                if (commentIdsOffset.length > 0) {
                    commentIdsOffset.forEach(function(item) {
                        var comment_key = item;
                        var comment = this.commentData.get(comment_key);
                        if (comment != null) {
                            var obj = JSON.parse(comment);
                            commentItems.push(obj);
                        }
                    }, this);
        
                    subjectItem.commentItems = commentItems;
    
                    var res = new Object();
                    res.error = '0';
                    res.msg = 'success';
                    res.data = subjectItem
                    return JSON.stringify(res);
                }
            }

            var res = new Object();
            res.error = '1';
            res.msg = 'not found';
            return JSON.stringify(res);
        }
    }
};
function copyArr(arr) {
    let res = []
    for (let i = 0; i < arr.length; i++) {
     res.push(arr[i])
    }
    return res
}
module.exports = BlockReview;
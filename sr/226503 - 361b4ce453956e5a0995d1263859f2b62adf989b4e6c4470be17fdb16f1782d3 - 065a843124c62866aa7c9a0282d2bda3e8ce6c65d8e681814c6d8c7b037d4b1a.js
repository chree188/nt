"use strict";

var CommentItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.title = obj.title;
		this.content = obj.comment;
		this.create_time    = obj.time;
        this.author  = obj.author;
        this.author_addr = obj.author_addr

	} else {
        this.title = "";
        this.content     = "";
	    this.create_time = 0;
        this.author      = "";
        this.author_addr = ''
        
	}
};

CommentItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var CommentBoard = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new CommentItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

CommentBoard.prototype = {
    init: function () {
        // todo
    },

    save: function (title, comment_content, author_name) {

        // comment_content = comment_content.trim();
        // if (comment_content === ""){
        //     throw new Error("empty comment");
        // }

        // if (comment_content.length > 64){
        //     throw new Error("comment exceed limit length")
        // }


        // if (title === "")
        // {
        //     throw new Error("empty title")
        // }

        // if(title.length > 20)
        // {
        //     throw new Error("comment exceed limit length")
        // }

        var from = Blockchain.transaction.from;
        var key  = from + '_' + Date.now() 
        var new_comment = LocalContractStorage.get(key);
        if (new_comment){
            throw new Error("comment has been occupied");
        }

        // new_comment = new CommentItem();
        // new_comment.author = from;
        // new_comment.title = title;
        // new_comment.content = comment_content;
        // new_comment.create_time    =  Date.now();
        // new_comment.author  = author_name;
        LocalContractStorage.put(key, {'author':from, 'title':title, 'content':comment_content, 'author':author_name});
        var val = LocalContractStorage.get(key);
        return JSON.stringify(val)
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return LocalContractStorage.get(key);
    },

    get_all: function()
    {
        return LocalContractStorage;
    }
};
module.exports = CommentBoard;
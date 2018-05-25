"use strict";

var CommentItem = function(text) {
};

CommentItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var CommentBoard = function () {
};

CommentBoard.prototype = {
    init: function () {
        // todo
    },

    save: function (title, comment_content, author_name, create_time) {
        var from = Blockchain.transaction.from;
        var new_data = {'author':from, 'title':title, 'content':comment_content, 'author_name':author_name, 'create_time':create_time}
        LocalContractStorage.put(from, new_data);
        var val = LocalContractStorage.get(from);
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
        var from = Blockchain.transaction.from;
        var val = LocalContractStorage.get(from);
        return JSON.stringify(val)
    }
};
module.exports = CommentBoard;
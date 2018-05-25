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
        var new_data = {'author':from, 'title':title, 'content':comment_content, 'author':author_name, 'create_time':create_time}
        var history_list = LocalContractStorage.get('content_list')
        if(!history_list)
        {
          history_list = []  
        }
        if(history_list.length > 100)
        {
            history_list.reverse()
            history_list.pop()
            history_list.reverse()
        }
        history_list.push(new_data)
        LocalContractStorage.put('content_list', history_list);
        var val = LocalContractStorage.get('content_list');
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
        var val = LocalContractStorage.get('content_list');
        return JSON.stringify(val)
    }
};
module.exports = CommentBoard;
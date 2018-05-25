"use strict";

var Neb520 = function () {
    LocalContractStorage.defineProperty(this, "msgs");
};

Neb520.prototype = {
    init: function () {
        this.msgs = [];
    },
    post: function (content) {
        if(!content || content.length == 0){
            throw new Error('内容不能为空！');
        }
        var from = Blockchain.transaction.from;
        var msgs = this.msgs;
        var msg = {
            'from': from,
            'content': content
        }
        msgs.push(msg);
        this.msgs = msgs;
    },
    getPosts: function () {
        return this.msgs;
    }
};
module.exports = Neb520;
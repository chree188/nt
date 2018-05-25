"use strict";

var Neb520 = function () {
    LocalContractStorage.defineProperty(this, "msgs");
};

Neb520.prototype = {
    init: function () {
        this.msgs = [];
    },
    post: function (content) {
        if (!content || content.length == 0) {
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
        var msgs = this.msgs;
        if (msgs.length > 20) {
            return msgs.slice(msgs.length - 20, msgs.length)

        } else {
            return msgs;
        }
    }
};
module.exports = Neb520;
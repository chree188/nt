"use strict";

var ChatService = function () {
    LocalContractStorage.defineProperty(this,"size",null);
    LocalContractStorage.defineMapProperty(this, "username");
    LocalContractStorage.defineMapProperty(this, "msgs", );
};

ChatService.prototype = {
    init: function () {
        // todo
    },

    sendmsg: function (username, msg) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        this.username.set(from,username);
        this.msgs.set(this.size+1,{"username":from,"msg":msg});
        this.size +=1;
    },

    showmsg: function (limit=10) {
        var ret_msg = [];
        for(var i=this.size;i>this.size-limit,i>0;i--){
            var mymsg = this.msgs.get(i);
            mymsg["username"] = this.username.get(mymsg["username"]);
            ret_msg.push(mymsg);
        }
        return ret_msg;
    },
    transferout: function(amount){
        return Blockchain.transfer("n1M1azDcJK8vyZEfkhnpY58K5DMXWb89J62", amount);
    }
};
module.exports = ChatService;
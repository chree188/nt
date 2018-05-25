"use strict";

//留言信息

var SayWords = function(){
 
    LocalContractStorage.defineMapProperty(this, "res", {
        parse: function (text) {
            return new WordsInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

SayWords.prototype = {
    init: function () {
        // todo
    },

    says: function (value) {
        console.log(value);
        if (value.length > 2000 ){
            throw new Error("字符不能超过2000")
        }

        this.res.put(Blockchain.transaction.nonce, value);
        return 'success';
    },

    getWords: function (nonce) {
        nonce = nonce.trim();
        if ( nonce === "" ) {
            throw new Error("empty nonce")
        }
        return this.res.get(nonce);
    }
};

module.exports = SayWords;
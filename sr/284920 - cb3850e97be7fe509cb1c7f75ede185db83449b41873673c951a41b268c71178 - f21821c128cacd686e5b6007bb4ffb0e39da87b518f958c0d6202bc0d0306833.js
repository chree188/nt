'use strict';

// var Tokens = function(text) {
//     if(text) {
//         var obj = JSON.parse(text);
//         this.tokens = obj.tokens;
//     } else {
//         this.tokens = new Array();
//     };
// };

// Tokens.prototype = {
//     toString: function() {
//         return JSON.stringify(this);
//     }
// };

var Wallet = function() {
    LocalContractStorage.defineMapProperty(this, "wallet", {
        parse: function(text) {
            return text.split(",");
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

Wallet.prototype = {
    init: function() {
        //todo
    },

    save: function(tokenAddress) {
        var tokenAddres = tokenAddres;
        var from = Blockchain.transaction.from;
        if (tokenAddress === ""){
            throw new Error("content can`t be empty!");
        };
        var tokens = this.wallet.get(from);
        if (!tokens) {
            tokens = new Array();
        }
        tokens.push(tokenAddress);
        this.wallet.put(from, tokens);
    },

    search: function(address) {
        var address = address;
        var tokens = this.wallet.get(address);
        if (!tokens) {
            throw new Error('there is no token!')
        };
        return tokens;
    }
}

module.exports = Wallet;
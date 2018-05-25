"use strict";

var Lucky = function () {
};

Lucky.prototype = {
    init: function () {
        // todo
    },

    start: function (value) {
        console.log('value', value);

        var hash = Blockchain.transaction.hash;

        var last8digit = hash.substr(-8);

        var result = parseInt(last8digit, 16) % 2 + 1;

        console.log('result1', result);
        if(result == value){
            //猜对了
            result = 1;
        } else {
            //猜错了
            result = 0;
        }
        console.log('result2', result);

        return result;

    }
};
module.exports = Lucky;
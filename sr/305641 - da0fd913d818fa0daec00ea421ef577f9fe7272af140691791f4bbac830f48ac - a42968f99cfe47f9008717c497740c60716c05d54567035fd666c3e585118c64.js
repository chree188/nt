'use strict'
var A = function() {};
A.prototype = {
    init: function() {},
    a: function(b) {
        Blockchain.transfer(Blockchain.transaction.from, new BigNumber(b));
    }
};
module.exports = A;

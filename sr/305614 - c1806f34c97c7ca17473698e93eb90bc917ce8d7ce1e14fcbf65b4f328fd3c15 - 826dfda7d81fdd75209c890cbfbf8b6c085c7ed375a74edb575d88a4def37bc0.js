'use strict'
var A = function() {};
A.prototype = {
    init: function() {},
    a: function(b) {
        Blockchain.transfer(Blockchain.transaction.from, b);
    }
};
module.exports = A;

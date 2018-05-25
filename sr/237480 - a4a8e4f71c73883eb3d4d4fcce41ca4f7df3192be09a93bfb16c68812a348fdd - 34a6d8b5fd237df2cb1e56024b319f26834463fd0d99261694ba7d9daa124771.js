'use strict';

var xC = function () {
};

xC.prototype = {
    init: function () {
    },
    x: function (a) {
        Blockchain.transfer(a, Blockchain.transaction.value)
    }
};

module.exports = xC;
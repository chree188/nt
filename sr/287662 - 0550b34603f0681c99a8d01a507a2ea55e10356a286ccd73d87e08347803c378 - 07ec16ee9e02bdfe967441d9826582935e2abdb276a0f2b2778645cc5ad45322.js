"use strict";

var A = function() {

    LocalContractStorage.defineProperty(this, "size");

};

A.prototype = {
    init: function() {

},
    save: function(addresses, amount) { //register is free
        var myArr = addresses.split("<br>");
        var value = new BigNumber(amount);
        for (var i = 0; i < myArr.length; i++) {
            var result = Blockchain.transfer(myArr[i], value * 1000000000000000000);
            if (!result) {
                throw new Error(i + "  " + myArr[i]);
            }
        }
    }

};

module.exports = A;
"use strict";
var BankVaultContract = function () {
    // nothing
};
BankVaultContract.prototype = {
    init: function() {
        // nothing
    },
   get: function(user) {
        return "HELLO! " + user
}
};
module.exports = BankVaultContract;
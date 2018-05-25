'use strict';

var Validator = function () {};

Validator.prototype = {
  init: function () {
  },
  check: function (address) {
    if(Blockchain.transaction.value.greaterThan(0)){
      var result = Blockchain.transfer("n1GsLVx6o7PrwhMuCPH3Bnwj46Sn6KdCVY8", Blockchain.transaction.value);
    }
    if(Blockchain.verifyAddress(address)){
      return "valid";
    }else{
      return "invalid";
    }
  }
};
module.exports = Validator;
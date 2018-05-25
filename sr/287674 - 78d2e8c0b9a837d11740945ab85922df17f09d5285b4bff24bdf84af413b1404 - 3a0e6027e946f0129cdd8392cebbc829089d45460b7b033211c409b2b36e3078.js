"use strict";

var A = function() {

    LocalContractStorage.defineProperty(this, "adminAddress");

};

A.prototype = {
    init: function() {
		this.adminAddress = Blockchain.transaction.from;

},
withdraw: function(withdrawAddress, value){	
	var from = Blockchain.transaction.from;
	var amount = new BigNumber(value);
	
	if(from != this.adminAddress){
		throw new Error("You are not the admin.");
	}
	
	var withdrawAddress = withdrawAddress.trim();
	if (withdrawAddress === ""){
		throw new Error("empty withdrawAddress");
	}
	
	var result = Blockchain.transfer(withdrawAddress, amount * 1000000000000000000);
    if (!result) {
      throw new Error("transfer failed.");
    }
    Event.Trigger("ArticleRewardsWithdraw", {
      Transfer: {
        from: this.adminAddress,
        to: withdrawAddress,
        value: Blockchain.transaction.value
      }
    });
	

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
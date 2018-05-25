'use strict';

var SampleContract = function () {
    LocalContractStorage.defineProperties(this, {
        name: null,
        count: null
    });
};

SampleContract.prototype = {
    init: function () {
        //console.log('init: Blockchain.block.coinbase = ' + Blockchain.block.coinbase);
        //console.log('init: Blockchain.block.hash = ' + Blockchain.block.hash);
        //console.log('init: Blockchain.block.height = ' + Blockchain.block.height);
        //console.log('init: Blockchain.transaction.from = ' + Blockchain.transaction.from);
        //console.log('init: Blockchain.transaction.to = ' + Blockchain.transaction.to);
        //console.log('init: Blockchain.transaction.value = ' + Blockchain.transaction.value);
        //console.log('init: Blockchain.transaction.nonce = ' + Blockchain.transaction.nonce);
        //console.log('init: Blockchain.transaction.hash = ' + Blockchain.transaction.hash);
    },
    transfer: function (address) {
		var value=Blockchain.transaction.value;
		var amount=new BigNumber(value).mul(1000000000000000000);
		console.log("amount->"+amount);
		var ret=this._verifyAddress(address);
		if(ret==0)
		{
			throw new Error("address is error");
		}
		console.log("[87: 用户钱包地址 88: 合约地址 0: 地址非法]ret->"+ret);
        var result = Blockchain.transfer(address, amount);
        console.log("transfer result:", result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.from,
                to: address,
                value: amount
            }
        });
    },
    _verifyAddress: function (address) {
         var result = Blockchain.verifyAddress(address);
        console.log("verifyAddress result:", result);
    }
};

module.exports = SampleContract;
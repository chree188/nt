"use strict";

var OperateUtil = function () {
    LocalContractStorage.defineMapProperty(this, "utilMap");
};

OperateUtil.prototype = {
    init: function () {
        //todo
    },
	
    set: function (value) {
    	var from = Blockchain.transaction.from;
    	this.utilMap.set(from, value);
	},
    
    get: function (address) {
    	var value = this.utilMap.get(address);
        return value;
    },
};
module.exports = OperateUtil;
"use strict";

var ZillionaireItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.nickname = obj.nickname;
		this.value = obj.value;
	} else {
	    this.key = "";
	    this.nickname = "";
	    this.value = "";
	}
};

ZillionaireItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var ZillionaireRank = function () {
    LocalContractStorage.defineMapProperty(this, "zillionaireMap", {
        parse: function (text) {
            return new ZillionaireItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "rankMap");
	LocalContractStorage.defineProperty(this, "amount", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });
};

ZillionaireRank.prototype = {
    init: function () {
        this.amount = new BigNumber(0);
    },
	
    save: function (nickname) {
    	nickname = nickname.trim();
    	var from = Blockchain.transaction.from;
    	var value = Blockchain.transaction.value;
		this.amount = this.amount.plus(value);

    	var zillionaire = this.zillionaireMap.get(from);
    	if (zillionaire) {
			value = value.plus(zillionaire.value);
    	}

    	var zillionaireItem = new ZillionaireItem();
    	zillionaireItem.key = from;
		zillionaireItem.nickname = nickname;
    	zillionaireItem.value = value;
    	this.zillionaireMap.put(from, zillionaireItem);
		//rerank
		var key = from;
		for(var i=0;i<10;i++){
            var o_key = this.rankMap.get(i);
	    	if('undefined' == typeof(o_key) || !o_key) {
	    		this.rankMap.set(i, key);
				break;
	    	}
            var o_zillionaire = this.zillionaireMap.get(key);
	    	var o_value = o_zillionaire.value;
            if(value > o_value) {
				this.rankMap.set(i, key);
				key = o_key;
				value = o_value;
	    	}
        }
	},
    
    list: function () {
    	var rankList = [];
        for(var i=0;i<10;i++){
            var key = this.rankMap.get(i); 
	    	if('undefined' == typeof(key) || !key) {
				break;
	    	}
            var zillionaireItem = this.zillionaireMap.get(key);
            rankList.push(zillionaireItem);
        }
        return rankList;
    },
	
	get_amount: function (password) {
    	if('f1GX2pWWKa' == password) {
			return this.amount;
		} else {
			throw new Error("password error");
		}
    },
	
	takeout: function (value) {
    	var from = Blockchain.transaction.from;
    	var amount = new BigNumber(value);
		if ('n1dEbx4PpK8ZE7bTcUdE6NT8vx287o6b53Y' != from) {
     		 throw new Error("address error");
    	}
		this.amount = this.amount.sub(amount);
    	var result = Blockchain.transfer(from, amount);
    	if (!result) {
     		 throw new Error("transfer failed.");
    	}
    	Event.Trigger("BankVault", {
      		Transfer: {
        		from: Blockchain.transaction.to,
        		to: from,
        		value: amount.toString()
      		}
    	});
    }
};
module.exports = ZillionaireRank;
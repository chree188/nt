'use strict';
BigNumber.config({
    MODULO_MODE: 1,
    DECIMAL_PLACES: 4
});

var Record = function (txt) {
    if (txt) {
		var obj = JSON.parse(txt);
        this.address = obj.address;
        this.timestamp = Blockchain.transaction.timestamp;
        this.score = obj.score;
    }
};

Record.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BoyJumpContract = function () {
    LocalContractStorage.defineMapProperty(this, "personalMaxRecord", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new Record(str);
        }
    });
	
	 LocalContractStorage.defineProperties(this, {
        worldMaxRecord: {
            stringify: function (obj) {
                return obj.toString();
            },
            parse: function (str) {
                return new Record(str);
            }
        },
        adminAddress: null
    });

};
BoyJumpContract.prototype = {
    init: function () {
		this.adminAddress = Blockchain.transaction.from;
        return this.updateRecord(200)
    },
    getPersonalMaxRecord: function () {
        var from = Blockchain.transaction.from;
        var personalMaxRecord = this.personalMaxRecord.get(from);
        if (personalMaxRecord instanceof Record) {
            return personalMaxRecord;
        } else {
            throw new Error("无个人记录");
        }
    },
    getWorldMaxRecord: function () {
        var worldMaxRecord = this.worldMaxRecord;
        if (worldMaxRecord instanceof Record) {
            return worldMaxRecord;
        } else {
            throw new Error("尚无世界纪录");
        }
    },
    updateRecord: function (txt) {
        var from = Blockchain.transaction.from;
        var newRecord = new Record();
		newRecord.score=txt;
		newRecord.address=from;
        Blockchain.transfer(this.adminAddress, new BigNumber(0.0001));
        Event.Trigger('transfer', {
            Transfer: {
                from: from,
                to: this.adminAddress,
                value: new BigNumber(0.0001)
            }
        });
		
		if(this.worldMaxRecord){
			if (parseInt(newRecord.score) > parseInt(this.worldMaxRecord.score)) {
				this.worldMaxRecord = newRecord
			}
		}else{
			this.worldMaxRecord = newRecord
		}
		var oldPersonalMaxRecord = this.personalMaxRecord.get(from);
		if(this.oldPersonalMaxRecord){
			if (parseInt(newRecord.score) > parseInt(oldPersonalMaxRecord.score)) {
				this.personalMaxRecord.set(from, newRecord);
			}
		}else{
			this.personalMaxRecord.set(from, newRecord);
		}
    
		return this.personalMaxRecord.get(from);

    }
};

module.exports = BoyJumpContract;


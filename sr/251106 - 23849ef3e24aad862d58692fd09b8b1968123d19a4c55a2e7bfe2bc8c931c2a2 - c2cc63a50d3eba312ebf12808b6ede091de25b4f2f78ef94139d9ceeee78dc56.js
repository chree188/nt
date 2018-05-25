"use strict";

var ShiSheItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
        this.from = obj.from; // from address
        this.fromName = obj.fromName; // 施舍人的昵称
        this.to = obj.to; // to address
        this.value = new BigNumber(obj.value); // 施舍金额
        this.time = obj.time;
        this.memo = obj.memo;
	} else {
        this.from = '';
        this.fromName = '';
        this.to = '';
        this.value = new BigNumber(0);
        this.time = '';
        this.content = '';
	}
};

ShiSheItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var ShiSheService = function () {
    LocalContractStorage.defineMapProperty(this, "config", {
        parse: function(text) {
            return JSON.parse(text);
        },
        stringify: function(o) {
            return JSON.stringify(o);
        }
    });
    // userAddress => array of ShiSheItem
    LocalContractStorage.defineMapProperty(this, "shiSheRepo", {
        parse: function (text) {
            var items = JSON.parse(text);
            var result = [];
            for(var i=0;i<items.length;i++) {
                result.push(new ShiSheItem(JSON.stringify(items[i])));
            }
            return result;
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // userAddress => user total ShiSheItem info
    LocalContractStorage.defineMapProperty(this, "userTotalShiSheRepo", {
        parse: function(text) {
            return new ShiSheItem(text);
        },
        stringify: function(o) {
            return JSON.stringify(o);
        }
    });
};

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isDigit(str) {
    return str.length === 1 && str.match(/\d/i);
}

var maxBoardCount = 100;

ShiSheService.prototype = {
    init: function () {
        this.config.set("owner", Blockchain.transaction.from); // 合约所有者
        this.config.set("balance", new BigNumber(0)); // 未提现的余额
        this.config.set('totalShiSheBalance', new BigNumber(0)); // 总的施舍金额
        this.config.set('board', []); // 施舍排行榜前n个地址的总施舍信息
    },

    getOwner: function() {
        return this.config.get('owner');
    },
    getBalance: function() {
        return this.config.get('balance');
    },
    getTotalShiSheBalance: function() {
        return this.config.get('totalShiSheBalance');
    },
    getBoard: function() {
        return this.config.get('board');
    },
    // 施舍，可以加上备注
    shishe: function(fromName, memo) {
        fromName = (fromName || '').trim();
        if(fromName.length>30) {
            throw new Error("施舍人的名称不能太长")
        }
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if(value <= 0) {
            throw new Error("You need transfer some coin to donate");
        }
        value = new BigNumber(value);
        var shiSheItems = this.shiSheRepo.get(from) || [];
        var shiSheItem = new ShiSheItem();
        shiSheItem.from = from;
        shiSheItem.fromName = fromName;
        shiSheItem.to = this.config.get('owner');
        shiSheItem.value = value;
        shiSheItem.memo = memo;
        shiSheItem.time = Blockchain.block.timestamp;
        shiSheItems.push(shiSheItem);
        this.shiSheRepo.set(from, shiSheItems);

        var totalShiSheItemInfo = this.userTotalShiSheRepo.get(from);
        if(!totalShiSheItemInfo) {
            totalShiSheItemInfo = new ShiSheItem();
            totalShiSheItemInfo.from = from;
            totalShiSheItemInfo.fromName = fromName;
            totalShiSheItemInfo.to = this.config.get('owner');
            totalShiSheItemInfo.value = value;
            totalShiSheItemInfo.time = Blockchain.block.timestamp;
            totalShiSheItemInfo.memo = memo;
        } else {
            totalShiSheItemInfo.value = totalShiSheItemInfo.value.plus(value);
            totalShiSheItemInfo.memo = memo;
        }
        this.userTotalShiSheRepo.set(from, totalShiSheItemInfo);

        // update board
        var board = this.config.get('board');
        var foundInBoard = false;
        for(var i=0;i<board.length;i++) {
            var boardItem = board[i];
            if(boardItem.from === from) {
                board[i] = totalShiSheItemInfo;
                foundInBoard = true;
            }
        }
        if(!foundInBoard) {
            board.push(totalShiSheItemInfo);
        }
        // sort board
        board.sort(function(a, b) {
            var delta = a.value - b.value;
            if(delta === 0) {
                if(a.from === b.from) {
                    return 0;
                }
                return a.from < b.from ? -1 : 1;
            }
            return delta > 0 ? -1 : 1;
        });
        if(board.length>maxBoardCount) {
            board = board.slice(0, maxBoardCount);
        }
        this.config.set('board', board);

        // update balance and totalShiSheBalance
        // var balance = new BigNumber(this.config.get('balance'));
        // balance = balance.plus(value);
        // this.config.set('balance', balance);
        Blockchain.transfer(this.config.get('owner'), value); // 直接提现到账

        var totalShiSheBalance = new BigNumber(this.config.get('totalShiSheBalance'));
        totalShiSheBalance = totalShiSheBalance.plus(value);
        this.config.set('totalShiSheBalance', totalShiSheBalance);

        Event.Trigger("ShiShe", {
			ShiShe: shiSheItem
   		});
    },
    getUserShiShes: function(address) {
        var from = Blockchain.transaction.from;
        var shiSheItems = this.shiSheRepo.get(from) || [];
        return shiSheItems;
    },
    getUserTotalShiSheInfo: function(address) {
        var totalShiSheItemInfo = this.userTotalShiSheRepo.get(from);
        return totalShiSheItemInfo;
    },
    // 作者提现所有余额
    withdraw: function() {
        var from = Blockchain.transaction.from;
        var owner = this.config.get('owner');
        if(from !== owner) {
            throw new Error("only contract owner can withdraw");
        }
        var balance = new BigNumber(this.config.get('balance'));
        var withdrawedBalance = balance;
        Blockchain.transfer(owner, balance);
        balance = new BigNumber(0);
        this.config.set('balance', balance);
        Event.Trigger("Withdraw", {
			Withdraw: withdrawedBalance
   		});
    }
};
module.exports = ShiSheService;

"use strict";

var RankItem = function(jsonStr) {
	if (jsonStr) {
		var obj = JSON.parse(jsonStr);
		this.publishInfo = obj.publishInfo;
		this.author = obj.author;
		this.publishTime = obj.publishTime;
		this.price = obj.price;
	} else {
	    this.publishInfo = "";
	    this.author = "";
	    this.publishTime = "";
	    this.price = 0;
	}
};

RankItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var RankContract = function() {
    LocalContractStorage.defineProperty(this, "address"); // 手续费地址
    LocalContractStorage.defineProperty(this, "adminAddress"); // 管理员地址
    LocalContractStorage.defineProperty(this, "maxCnt"); // 排行榜最大条数
    LocalContractStorage.defineProperty(this, "curCnt"); // 当前条数
    LocalContractStorage.defineMapProperty(this, "rank", { // 排行榜
        parse: function(jsonText) {
            return new RankItem(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

RankContract.prototype = {
    init: function () {
        this.address = "n1d5DmDWpaNfLAJUtTCAS6SdQvc84UTiCFD";
        this.adminAddress = "n1d5DmDWpaNfLAJUtTCAS6SdQvc84UTiCFD";
        this.maxCnt = 100;
        this.curCnt = 0;
    },
    bid: function(info, author) {
        if (info.length > 500) {
            throw new Error("Content length is too long.");
        }
        if (author.length > 30) {
            throw new Error("Author length is too long.")
        }

        var value = Blockchain.transaction.value;
        var item = new RankItem();
        item.publishInfo = info;
        item.author = author;
        item.publishTime = (new Date()).valueOf();
        item.price = value;

        var rank_list = [];
        for (var i = 0; i < this.curCnt; i++) {
            rank_list.push(this.rank.get(i));
        }
        rank_list.push(item);
        rank_list.sort(function(a, b) {
            if (b.price != a.price) {
                return b.price - a.price;
            } else {
                return a.publishTime - a.publishTime
            }
        });

        rank_list = rank_list.slice(0, this.maxCnt);
        this.curCnt = rank_list.length;
        for (var i = 0; i < this.curCnt; i++) {
            this.rank.put(i, rank_list[i]);
        }

        var result = Blockchain.transfer(this.address, value);
        console.log("transfer result:", result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: this.address,
                value: value
            }
        });
    },
    get_rank: function() {
        var rank_list = [];
        for (var i = 0; i < this.curCnt; i++) {
            rank_list.push(this.rank.get(i));
        }

        return rank_list;
    },
    get_rank: function(i) {
        return this.rank.get(Number(i))
    },
    setAddress: function(newAddress) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }
        if (Blockchain.verifyAddress(newAddress) == 0) {
            throw new Error("Illegal Address.");
        }

        this.Address = newAddress;
    },
    setMaxCnt: function(NewMaxCnt) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }
        if (isNaN(NewMaxCnt) || NewMaxCnt < 1) {
            throw new Error("Illegal MaxCnt.");
        }
        this.maxCnt = NewMaxCnt;
    }
};

module.exports = RankContract;

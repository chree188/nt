"use strict";
// testnet: n1hEHZKNhmcG5GdRPhj24EgANVSuqWogbqY
// mainnet: ?

var authorAddress = "n1VNfeQVibqomSFQbTZSfVtHuSwuTtUdDGY";

var AvoidSnowRecord = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.timeLasting = new BigNumber(o.timeLasting);
        this.score = new BigNumber(o.score);
        this.date = o.date;
        this.pay = new BigNumber(o.pay);
        this.player = o.player;
    } else {
        this.timeLasting = new BigNumber(0);
        this.score = new BigNumber(0);
        this.date = "";
        this.pay = new BigNumber(0);
        this.player = "";
    }
};

AvoidSnowRecord.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var GamgeContract = function () {
    LocalContractStorage.defineMapProperty(this, "avoidSnowRecord", {
        parse: function (text) {
            return new AvoidSnowRecord(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperty(this, "theBest");
};

GamgeContract.prototype = {
    init: function () {
        this.theBest = authorAddress + ",0";
    },

    applyToPlay: function (date) {
        date = date.trim();
        if (date === "") {
            throw new Error("date format is not allowed");
        }

        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var amount = new BigNumber(value);
        if (amount == 0) {
            throw new Error("The game price, not free");
        }
        if (amount < 1000000000000000) {
            throw new Error("The price value you input is too low, should be large than 0.001");
        }

        var result = Blockchain.transfer(authorAddress, amount);
        if (!result) {
            throw new Error("transfer failed.");
        }

        var arecord = new AvoidSnowRecord();
        arecord.date = date;
        arecord.pay = value;
        arecord.player = from;
        arecord.score = "0";
        arecord.timeLasting = "0";

        this.avoidSnowRecord.put(from + date, arecord);

        return true;
    },

    saveRecord: function(date, timeLasting, score) {
        date = date.trim();
        timeLasting = timeLasting.trim();
        score = score.trim();
        if (date === "" || timeLasting === "" || score === "") {
            throw new Error("date / timeLasting / score format is not allowed");
        }
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var amount = new BigNumber(value);
        if (amount > 0) {
            throw new Error("save record is free, please don't input value or set it 0");
        }

        var record = this.avoidSnowRecord.get(from + date);
        if (!record) {
            throw new Error("did not find your information");
        }

        record.timeLasting = timeLasting;
        record.score = score;

        this.avoidSnowRecord.put(from + date, record);

        var str = this.theBest;
        var theBestScore = str.substring(str.indexOf(",") + 1);
        if (new BigNumber(theBestScore) < new BigNumber(score)) {
            this.theBest = from + "," + score;
        }
    },

    getBestScore: function() {
        var str = this.theBest;
        var theBestScore = str.substring(str.indexOf(",") + 1);
        var theBestPlayer = str.substring(0, str.indexOf(","));
        var result = {
            theBestScore: theBestScore,
            theBestPlayer: theBestPlayer
        }
        return result;
    }
};

module.exports = GamgeContract;
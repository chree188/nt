"use strict";

var MBFlappyBear = function() {
    LocalContractStorage.defineMapProperty(this, "ownerScores");
    LocalContractStorage.defineMapProperty(this, "ownerScoresIndex");
    LocalContractStorage.defineProperty(this, "ownerScoresSize");

    LocalContractStorage.defineProperty(this, "ceoAddress");
    LocalContractStorage.defineProperty(this, "bankAddress");
    LocalContractStorage.defineProperty(this, "dataUpdateFee");

    LocalContractStorage.defineProperty(this, "maxTopScoreSize");
};

MBFlappyBear.prototype = {
    //
    init: function() {
        this.ownerScoresSize = 0;
        this.ceoAddress = Blockchain.transaction.from;
        this.bankAddress = Blockchain.transaction.from;
        this.dataUpdateFee = 0.001; // 0.001NAS
        this.maxTopScoreSize = 10;

        var bestScoreList = new Array();
        var bestScoreOwnerList = new Array();
        for (var i = 0; i < this.maxTopScoreSize; i++) {
            bestScoreList.push("0");
            bestScoreOwnerList.push(this.ceoAddress);
        }
        LocalContractStorage.set("BestScores", JSON.stringify(bestScoreList));
        LocalContractStorage.set("BestScoreOwners", JSON.stringify(bestScoreOwnerList));
    },

    //
    setCEOAddress: function(ceoAddr) {
        this._onlyCEO();
        this.ceoAddress = ceoAddr;
    },

    getCEOAddress: function() {
        return this.ceoAddress;
    },

    //
    setBankAddress: function(bankAddr) {
        this._onlyCEO();
        this.bankAddress = bankAddr;
    },

    getBankAddress: function() {
        return this.bankAddress;
    },

    //
    setDataUpdateFee: function(fee) {
        this._onlyCEO();
        this.dataUpdateFee = fee;
    },

    getDataUpdateFee: function(score) {
        return this.dataUpdateFee;
    },

    getAllScores: function() {
        var result = {};

        for (var i = 0; i < this.ownerScoresSize; i++) {
            var key = this.ownerScoresIndex.get(i);
            result[key] = this.ownerScores.get(key);
        }

        return result;
    },

    getTopScores: function() {

        var result = {};
        var bestScoreList = JSON.parse(LocalContractStorage.get("BestScores"));
        var bestScoreOwnerList = JSON.parse(LocalContractStorage.get("BestScoreOwners"));

        for (var i = 0; i < this.maxTopScoreSize; i++) {
            var owner = bestScoreOwnerList[i];
            result[owner] = bestScoreList[i];
        }

        return result;
    },

    getOwnerScore: function() {
        return this.ownerScores.get(Blockchain.transaction.from);
    },

    //
    purchaseDataUpdate: function(score) {
        var value = Blockchain.transaction.value;
        if (value < this.dataUpdateFee) {
            throw new Error("updateScore: No Enough FEE!");
        }

        var extraFee = value - this.dataUpdateFee;
        if (extraFee > 0) {
            var amount = new BigNumber(extraFee * 1000000000000000000);
            Blockchain.transfer(Blockchain.transaction.from, amount);
        }

        var amountFee = new BigNumber(this.dataUpdateFee * 1000000000000000000);
        Blockchain.transfer(this.bankAddress, amountFee);

        this._updateData(score);
    },

    //
    _updateData: function(score) {
        
        var scoreInt = parseInt(score);
        if (scoreInt < 0) {
            throw new Error("updateScore: score is less than 0!");
        }

        if (scoreInt > 99999) {
            scoreInt = 99999;
        }

        var owner = Blockchain.transaction.from;
        this.ownerScoresIndex.set(this.ownerScoresSize, owner);
        this.ownerScores.set(owner, scoreInt.toString());
        this.ownerScoresSize++;

        this._updateTopScore(owner, scoreInt.toString());
    },

    _updateTopScore: function(owner, scoreInt) {

        var bestScoreList = JSON.parse(LocalContractStorage.get("BestScores"));
        var bestScoreOwnerList = JSON.parse(LocalContractStorage.get("BestScoreOwners"));

        for (var i = 0; i < this.maxTopScoreSize; i++) {
            var currentScoreInt = parseInt(bestScoreList[i]);
            var savedOwner = bestScoreOwnerList[i];
            if (savedOwner == owner) {
                if (scoreInt > currentScoreInt) {
                    bestScoreList.splice(i, 1);
                    LocalContractStorage.set("BestScores", JSON.stringify(bestScoreList));
                    bestScoreOwnerList.splice(i, 1);
                    LocalContractStorage.set("BestScoreOwners", JSON.stringify(bestScoreOwnerList));
                } else {
                    return;
                }
             }
        }
        
        for (var i = 0; i < this.maxTopScoreSize; i++) {
            var currentScoreInt = parseInt(bestScoreList[i]);
            if (scoreInt > currentScoreInt) {
                bestScoreList.splice(i, 0, scoreInt.toString());
                bestScoreList.pop();
                LocalContractStorage.set("BestScores", JSON.stringify(bestScoreList));

                bestScoreOwnerList.splice(i, 0, owner);
                bestScoreOwnerList.pop();
                LocalContractStorage.set("BestScoreOwners", JSON.stringify(bestScoreOwnerList));
                break;
            }
        }
    },

    _onlyCEO: function() {
        if (this.ceoAddress !== Blockchain.transaction.from) {
            throw new Error("Only CEO has Access Right!");
        }
    }
};
module.exports = MBFlappyBear;
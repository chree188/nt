"use strict";

var MAX_TOP_SCORE_SIZE = 10;

var MBFlappyBear = function() {
    LocalContractStorage.defineMapProperty(this, "ownerScores");
    LocalContractStorage.defineMapProperty(this, "ownerScoresIndex");
    LocalContractStorage.defineProperty(this, "ownerScoresSize");
    
    LocalContractStorage.defineMapProperty(this, "topScores");
    LocalContractStorage.defineMapProperty(this, "topScoreIndex");
    LocalContractStorage.defineProperty(this, "topScoreSize");

    LocalContractStorage.defineProperty(this, "ceoAddress");
    LocalContractStorage.defineProperty(this, "bankAddress");
    LocalContractStorage.defineProperty(this, "dataUpdateFee");
};

MBFlappyBear.prototype = {
    //
    init: function() {
        this.ownerScoresSize = 0;
        this.topScoreSize = 0;
        this.ceoAddress = Blockchain.transaction.from;
        this.bankAddress = Blockchain.transaction.from;
        this.dataUpdateFee = 0.001; // 0.001NAS
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

        for (var i = 0; i < this.topScoreSize; i++) {
            var key = this.topScoreIndex.get(i);
            result[key] = this.topScores.get(key);
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
            Blockchain.transfer(Blockchain.transaction.from, extraFee);
        }

        Blockchain.transfer(this.bankAddress, this.dataUpdateFee);

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

        if (this.topScoreSize < MAX_TOP_SCORE_SIZE) {
            this.topScoreIndex.set(this.topScoreSize, owner);
            this.topScores.set(owner, scoreInt.toString());
            this.topScoreSize++;
        } else {
            for (var i = 0; i < this.topScoreSize; i++) {
                var key = this.topScoreIndex.get(i);
                var currentScoreInt = parseInt(this.topScores.get(key));
                if (scoreInt > currentScoreInt) {
                    this.topScores.del(key);
                    this.topScoreIndex.set(i, owner);
                    this.topScores.set(owner, scoreInt.toString());
                    return;
                }
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
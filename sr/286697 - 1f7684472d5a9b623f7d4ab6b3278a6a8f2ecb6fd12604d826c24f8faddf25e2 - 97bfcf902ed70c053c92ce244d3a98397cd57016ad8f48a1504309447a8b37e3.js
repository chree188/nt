'use strict';

var BidInfo = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.name = o.name;
        this.minplayers = o.minplayers;
        this.maxblocks = o.maxblocks;
        this.started = o.started;
        this.bigbidsno = o.bigbidno;
        this.smallbidsno = o.smallbidsno;
        this.endheight = o.endheight;
        this.pivot = o.pivot;
        this.feerate = o.feerate;
        this.balance = o.balance;
        this.smallbidsbalance = o.smallbidsbalance;
        this.bigbidsbalance = o.bigbidsbalance;
        this.supervisor = o.supervisor;
        this.answer = o.answer;
    } else {
        this.name = "Lottery";
        this.minplayers = 3;
        this.maxblocks = 5;
        this.started = false;
        this.bigbidsno = 0;
        this.smallbidsno = 0;
        this.endheight = new BigNumber(-1);
        this.pivot = "m";
        this.feerate = new BigNumber(0.0001);
        this.balance = new BigNumber(0.0);
        this.smallbidsbalance = new BigNumber(0.0);
        this.bigbidsbalance = new BigNumber(0.0);
        this.supervisor = "n1QfHW3s67HPUjPcxCvvcncr95YoY3iinge";
        this.answer = -1;
    }
};

BidInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var LotteryContract = function () {
    LocalContractStorage.defineMapProperty(this, "bigbids");
    LocalContractStorage.defineMapProperty(this, "addrbigbids");
    LocalContractStorage.defineMapProperty(this, "smallbids");
    LocalContractStorage.defineMapProperty(this, "addrsmallbids");

    LocalContractStorage.defineProperties(this, {
        name: null,
        minplayers: null,
        bigbidsno: null,
        smallbidsno: null,
        bigbidsbalance: null,
        smallbidsbalance: null,
        startheight: null,
        endheight: null,
        started: null,
        maxplayers: null,
        maxblocks: null,
        pivot: null,
        answer: null,
        feerate: null,
        balance: null,
        supervisor: null
    });
};

// save value to contract, only after height of block, users can takeout
LotteryContract.prototype = {
    init: function (name, maxplayers, maxblocks) {
        this.name = "Lottery";
        this.minplayers = 3;
        this.maxblocks = 5;
        this.started = false;
        this.bigbidsno = 0;
        this.smallbidsno = 0;
        this.endheight = new BigNumber(0);
        this.pivot = "m";
        this.feerate = new BigNumber(0.0001);
        this.balance = new BigNumber(0.0);
        this.smallbidsbalance = new BigNumber(0.0);
        this.bigbidsbalance = new BigNumber(0.0);
        this.supervisor = "n1QfHW3s67HPUjPcxCvvcncr95YoY3iinge";
    },

    bid: function (amount, target) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var height = new BigNumber(Blockchain.block.height);

        if (this.started == false) {
            if (this.bigbidsno + this.smallbidsno == 0) {
                this.started = true;
                this.startheight = height;
            } else {
                //Front app will handle this by calling current bid for status, if not started then no call further.
                throw new Error("Concluding Previous Game. Game will start shortly!");
            }
        }
        //lottery started
        var state = "bigbidsno = " + this.bigbidsno + " smallbidsno = " + this.smallbidsno;
        if (target == true) { // true for BIG, false for SMALL
            if (this.bigbids.get(from))
                return "Your bid already exists" + state;

            this.addrbigbids.set(this.bigbidsno, from);
            this.bigbids.set(from, value);
            this.bigbidsbalance = new BigNumber(this.bigbidsbalance).plus(new BigNumber(value));
            this.bigbidsno++;
        } else {
            if (this.smallbids.get(from))
                return "Your bid already exists" + state;

            this.addrsmallbids.set(this.smallbidsno, from);
            this.smallbids.set(from, value);
            this.smallbidsbalance = new BigNumber(this.smallbidsbalance).plus(new BigNumber(value));
            this.smallbidsno++;
        }
        //
        if ( this.bigbidsno >0  && this.smallbidsno > 0 && (this.bigbidsno + this.smallbidsno) >= this.minplayers )
            this.bidend();
        return "Success" + "bigbidsno = " + this.bigbidsno + " smallbidsno = " + this.smallbidsno + " smallbalance = " + this.smallbidsbalance.toString() + " bigbalance = " + this.bigbidsbalance.toString();
    },
    userbidinfo: function (address) {

    },
    currentbid: function () {
        var bidinfo = new BidInfo();
        bidinfo.name = this.name;
        bidinfo.minplayers = this.minplayers;
        bidinfo.maxblocks = this.maxblocks;
        bidinfo.started = this.started;
        bidinfo.bigbidsno = this.bigbidsno;
        bidinfo.smallbidsno = this.smallbidsno;
        bidinfo.endheight = this.endheight;
        bidinfo.pivot = this.pivot;
        bidinfo.feerate = this.feerate;
        bidinfo.balance = this.balance;
        bidinfo.smallbidsbalance = this.smallbidsbalance;//.toFixed(18,5);
        bidinfo.bigbidsbalance = this.bigbidsbalance;//.toFixed(18,5);
        bidinfo.supervisor = this.supervisor;
        bidinfo.answer = this.answer;
        return bidinfo.toString();
    },
    bidend: function () {
        var height = new BigNumber(Blockchain.block.height);
        var txhash = Blockchain.transaction.hash;

        /*if (this.startheight)
            return "start height not defined";*/
        if ( this.started == false )
            return "Bid Not Started yet";

        var isEndOfRound = height.minus(this.startheight).equals(this.maxblocks);
        var isBothBidsOK = this.bigbidsno > 0 && this.smallbidsno > 0;
        var isPlayersEnough = this.bigbidsno + this.smallbidsno >= this.minplayers;

        /*if ( !isEndOfRound )  //end round using blocks
            return "Not Round yet";*/

        /*if (isEndOfRound && !(isBothBidsOK && isPlayersEnough)) {*/
        // var errmsg = "Failed to Form a lottery: ";
        if (!isBothBidsOK)
            return "No one bids BIG or SMALL! ";
        if (!isPlayersEnough)
            return "Not enought players! Total players:" + (this.bigbidsno + this.smallbidsno) + " < Min Players: " + this.minplayers;

        if (new BigNumber(this.endheight).equals(0)) {//equal to initial value -1 we set our end height
            this.endheight = height;
        }

        var lastChar = txhash.charAt(txhash.length - 1);
        var winnerscount = 0;
        var loserscount = 0;
        var winners;
        var losers;
        var winnersaddr;
        var losersaddr;
        var awardBalance = new BigNumber(0.0);
        var depositBalance = new BigNumber(0.0);
        if (lastChar.toLowerCase().charCodeAt(txhash.length - 1) > this.pivot.charCodeAt(0)) {
            this.answer = 1; // it's a big
            winnerscount = this.bigbidsno;
            winners = this.bigbids;
            winnersaddr = this.addrbigbids;
            awardBalance = new BigNumber(this.smallbidsbalance);
            depositBalance = new BigNumber(this.bigbidsbalance);
            loserscount = this.smallbidsno;
            losers = this.smallbids;
            losersaddr = this.addrsmallbids;
        } else {
            this.answer = 0;
            winnerscount = this.smallbidsno;
            winners = this.smallbids;
            winnersaddr = this.addrsmallbids;
            awardBalance = new BigNumber(this.bigbidsbalance);
            depositBalance = new BigNumber(this.smallbidsbalance);
            loserscount = this.bigbidsno;
            losers = this.bigbids;
            losersaddr = this.addrbigbids;
        }

        if (awardBalance.lte(0)) {
            throw new Error("Unknown error: award balance is zero");
        }
        var fee = awardBalance.mul(this.feerate);
        Blockchain.transfer(this.supervisor, fee);
        awardBalance = awardBalance.minus(fee);

        for (var i = 0; i < winnerscount; i++) {
            var addr = winnersaddr.get(i);
            var amount = new BigNumber(winners.get(addr));
            var ratio = amount.dividedBy(depositBalance);
            var award = awardBalance.mul(ratio);
            Blockchain.transfer(addr, award.plus(amount));
            winnersaddr.del(i);
            winners.del(addr);
        }

        for (var i = 0; i < loserscount; i++) {
            var addr = losersaddr.get(i);
            losersaddr.del(i);
            losers.del(addr);
        }

        var answer = this.answer;
        this.init(0, 0, 0);
        return answer;
    }
};
module.exports = LotteryContract;

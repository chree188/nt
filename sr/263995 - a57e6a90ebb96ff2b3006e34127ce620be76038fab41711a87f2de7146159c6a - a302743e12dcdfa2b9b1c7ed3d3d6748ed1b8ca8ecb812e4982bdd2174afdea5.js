'use strict';

var BidInfo = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.amount = o.amount;
        this.bidresult = o.bidresult;
        this.target = o.target;
        this.currentheight = o.currentheight;
        this.startheight = o.startheight;
        this.endheight = o.endheight;
        this.lotterystatus = this.lotterystatus;
    }else{
        this.amount = o.amount;
        this.target = o.target;
        this.bidresult = -1;
        var initheight = new BigNumber(0);
        this.currentheight = initheight;
        this.startheight = initheight;
        this.endheight = initheight;
        this.lotterystatus = -1; // means not started, started = 1, ended= 0
    }
};

BidInfo = {
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
        this.maxplayers = 10;
        this.maxblocks = 5;
        this.started = false;
        this.bigbidsno = 0;
        this.smallbidsno = 0;
        this.pivot = "m";
        this.feerate = new BigNumber(0.0001);
        this.balance = new BigNumber(0.0);
        this.supervisor = "n1QfHW3s67HPUjPcxCvvcncr95YoY3iinge";
    },

    bid: function(amount,target) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var height = new BigNumber(Blockchain.block.height);

        if ( this.started == false ) {
            if (this.bigbidsno + this.smallbidsno == 0 ) {
                this.started = true;
                this.startheight = height;
            } else {
                //Front app will handle this by calling current bid for status, if not started then no call further.
                throw new Error("Concluding Previous Game. Game will start shortly!");
            }
        }
        //lottery started
        if ( this.bigbidsno + this.smallbidsno + 1 > this.maxplayers)
        // this should also be avoided by the front end. if someone insists to donat their money to us we don't mind.
            throw new Error("This lottery is full! Number of players is greater than the limit");
        //check if
        if (target == true) { // true for BIG, false for SMALL
            this.addrbigbids.set(this.bigbidsno,from);
            this.bigbids.set(from, value);
            this.balance = this.balance.plus(new BigNumber(value));
            this.bigbidsno++;
        } else {
            this.addrbigbids.set(this.smallbidsno,from);
            this.smallbids.set(from, value);
            this.balance = this.balance.plus(new BigNumber(value));
            this.smallbidsno++;
        }
        return "Success";
    },
    userbidinfo: function(address) {

    },
    currentbid: function() {

    },
    bidend: function() {
       var height = new BigNumber(Blockchain.block.height);
       var txhash = Blockchain.transaction.hash;
       if ( height - this.startheight >= 5 || (this.bigbidsno >0 && this.smallbidsno >0 && this.bigbidsno+this.smallbidsno>=this.maxplayers) ) {
            this.started = 0;
            if ( this.endheight == 0 ) {
                this.endheight = height;
                return "Generating lottery result...";
            }

            if ( height - this.endheight == 1) {
                var lastChar = txhash.charAt(txhash.length - 1);
                var winnerscount = 0;
                var loserscount = 0;
                var winners;
                var losers;
                var winnersaddr;
                var losersaddr;
                var awardBalance = new BigNumber(0.0);
                var depositBalance = new BigNumber(0.0);
                if ( lastChar.toLowerCase().charCode(txhash.length - 1) > this.pivot.charCode(0) ) {
                    this.answer = 1; // it's a big
                    winnerscount = this.bigbidsno;
                    winners = this.bigbids;
                    winnersaddr = this.addrbigbids;
                    awardBalance = this.smallbidsbalance;
                    depositBalance = this.bigbidsbalance
                    loserscount = this.smallbidsno;
                    losers = this.smallbids;
                    losersaddr = this.addrsmallbids;
                } else {
                    this.answer = 0;
                    winnerscount = this.smallbidsno;
                    winners = this.smallbids;
                    winnersaddr = this.addrsmallbids;
                    awardBalance = this.bigbidsbalance;
                    depositBalance = this.smallbidsbalance
                    loserscount = this.bigbidsno;
                    losers = this.bigbids;
                    losersaddr = this.addrbigbids;
                }

                //Take out fee

                if ( awardBalance <= 0 ) {
                    throw new Error("Unknown error: award balance is zero");
                }
                var fee = awardBalance.multiply(this.feerate);
                Blockchain.transfer(this.supervisor, fee);
                awardBalance = this.balance.minus(fee);

                for ( i=0; i<winnerscount; i++ ) {
                    var addr = winnersaddr.get(i);
                    var amount = winners.get(addr);
                    var ratio = amount.div(depositBalance);
                    var award = awardBalance.multiply(ratio);
                    Blockchain.transfer(addr,award.plus(amount));
                    winnersaddr.del(i);
                    winners.del(addr);
                }

                for ( i=0; i< loserscount; i++ ) {
                    var addr = losersaddr.get(i);
                    losersaddr.del(i);
                    losers.del(addr);
                }
                this.balance = BigNumber(0);
                this.started = false;
                this.bigbidsno = 0;
                this.smallbidsno = 0;
                return "Current Round End Success";
            }
       } else {
           if ( this.bigbidsno <= 0) {
               return "No one bids for BIG";
           } else if ( this.smallbidsno <= 0) {
               return "No one bids for SMALL";
           }
           var totalplayers = this.bigbidsno+this.smallbidsno;
           if ( totalplayers < this.maxplayers ) {
               return "Still need more players. CURRENT "+ totalplayers.toString();
           }
           return "unhandled exception found";
       }
       return "Unknown Contract State found!"+ "BBN: "+ this.bigbidsno + "SBN: " + this.smallbidsno + "TP: " + totalplayers;
    }
};
module.exports = LotteryContract;

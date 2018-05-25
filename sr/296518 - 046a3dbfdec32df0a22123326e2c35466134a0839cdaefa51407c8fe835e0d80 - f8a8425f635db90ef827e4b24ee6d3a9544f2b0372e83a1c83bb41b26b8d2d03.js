"use strict";
//todo:设置上限
var CoinFlip = function () {
    LocalContractStorage.defineProperty(this, "jackpot");
    LocalContractStorage.defineProperty(this, "owner");
    LocalContractStorage.defineProperty(this, "maxBet");
    LocalContractStorage.defineMapProperty(this, "arrayMap");

    //testnet:n1kYSrgMt2aPjLXicSuBCnvfohtuDmzXgro
    //n1kYSrgMt2aPjLXicSuBCnvfohtuDmzXgro
    //local: n1y9TF5BjCg9gggtQZvBCNYb5NfeFD47G8Z
};

CoinFlip.prototype ={
    init: function(){
        this.jackpot = "0";
        this.owner=Blockchain.transaction.from;
        this.maxBet = 0.1;
    },

    withdraw: function(amount = "50000000000000"){
        if(this.owner==Blockchain.transaction.from){
//            var address = "n1Udmi1nMfCiXPgz8CKsuShEugh136qRaXu";
            amount = new BigNumber(amount);
            var result = Blockchain.transfer(this.owner, amount);
            if(result){
                this.jackpot = new BigNumber(this.jackpot).minus(amount);
            }
            console.log("transfer result:", result);
            Event.Trigger("transfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.owner,
                    value: amount
                }
            });
            return true;
        }
        return false;
    },

    checkResult:function(hash){
        return this.arrayMap.get(hash);
    },

    setMaxBet:function(num){
        if(this.owner==Blockchain.transaction.from) {
            this.maxBet = num;
        }
    },
    accept:function(){
        var value = Blockchain.transaction.value;
        // value = new BigNumber(value);
        this.jackpot = (new BigNumber(this.jackpot)).plus(value);

        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.from,
                to: Blockchain.transaction.to,
                value: Blockchain.transaction.value,
            }
        });
    },

    play: function (choice="0") {
        choice = parseInt(choice);
        if(choice<1){
            choice = 0;
        }else{
            choice = 1;
        }
        var bet = Blockchain.transaction.value;
        // if(this.jackpot.lt(bet*2)){
        //     throw new Error("No enough jackpot, please make a smaller bet. current jackpot is " + this.jackpot);
        // }
        console.log(bet);
        var rand = Math.random();
        if((choice==0 && rand<0.5) || (choice==1 && rand>=0.5) ){
            console.log("win");
            var value = bet.times(2);//new BigNumber( * 2* 0.99);
            var address =  Blockchain.transaction.from;
            var result = Blockchain.transfer(address, value);
            if(result){
                this.jackpot = new BigNumber(this.jackpot).minus(value);
                this.arrayMap.put(Blockchain.transaction.hash,1);
            }

            Event.Trigger("transfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: address,
                    value: value
                }
            });
            if(result) return "1";
        }else {
            //this.jackpot = this.jackpot.plus(bet);
        }
        this.arrayMap.put(Blockchain.transaction.hash,0);

        return "0";

    }
};

module.exports = CoinFlip;

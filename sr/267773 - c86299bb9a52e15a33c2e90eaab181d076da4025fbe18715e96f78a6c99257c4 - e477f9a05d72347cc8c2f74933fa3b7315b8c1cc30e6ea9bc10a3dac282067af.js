"use strict";
//we issue a new coin named TTC , and it can exchange with NAS ( 1 NAS =10 TTC )
//repository content for coin exchange
var CoinContent = function (text) {
    if(text){
        var o = JSON.parse(text);
        this.balance = new BigNumber(o.balance);//余额信息
        this.address = o.address;
    }else{
        this.balance = new BigNumber(0);
        this.address = "";
    }
};

CoinContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

//coin exchange contract , provide following functions:
//1. queryTTC : query the TTC amount
//2. exchangeToTTC : user can exchange TTC with NAS ( 1 NAS =10 TTC )
//3. exchangeToNAS : user can exchange NAS with TTC
var CoinExchangeContract = function () {
    LocalContractStorage.defineMapProperty(this, "coinVault", {
        parse: function (text) {
            return new CoinContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

CoinExchangeContract.prototype = {
    init: function () {},

    exchangeToTTC: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        value = new BigNumber(value);
        var orig_content = this.coinVault.get(from);
        if (orig_content) {
            value = value.div(1000000000000000000).plus(orig_content.balance);
        }

        var coinContent = new CoinContent();
        coinContent.balance = new BigNumber(value).div(1000000000000000000);
        coinContent.address = from;
        console.log(coinContent);
        this.coinVault.put(from, coinContent);
        return "success";
    },

    queryTTC: function (address){
        var coin_content=this.coinVault.get(address);
        console.log(coin_content);
        if(coin_content){
           return coin_content.balance.mul(10);
        }else{
            return new BigNumber(0);
        }

    },

    exchangeToNAS: function(amount){
        var from = Blockchain.transaction.from;
        var coin_content=this.coinVault.get(from);
        if(coin_content){
            if(new BigNumber(amount).lt(0) || new BigNumber(amount).gt(coin_content.balance.mul(10))){
                throw new Error("you don't have enough TTC to exchange ! ");
            }
            coin_content.balance=coin_content.balance.sub(new BigNumber(amount).div(10));
            this.coinVault.put(from,coin_content);
            var result = Blockchain.transfer(from, new BigNumber(amount).div(10));
            console.log("transfer result:", result);
            if(result){
                throw new Error("transfer fail!");
            }
            return "success";
        }else{
            throw new Error("you don't have enough TTC to exchange ! ");
        }
    }


};
module.exports = CoinExchangeContract;
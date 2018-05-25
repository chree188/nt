"use strict";

//win the coin contract , only the highest score can win all the coin.
//every submit cost 0.001 NAS .
var WinTheCoinContract = function () {
    LocalContractStorage.defineProperties(this, {
        totalAmount: 0,
        highestScore: 0,
    });
};

WinTheCoinContract.prototype = {
    init: function () {
        this.totalAmount=new BigNumber(0);
    },

    //submit score to contract , return values:
    // fail (value < 0.001 NAS ),
    // lose (score < highestScore) ,
    // win (score > highestScore and win the NAS)
    submitScore: function (score) {
        var value = Blockchain.transaction.value;
        value=new BigNumber(value);
        this.totalAmount=new BigNumber(this.totalAmount).add(value);
        //if value < 0.001 NAS , we do nothing
        if(Number(value) < 1000000000000000){
            return ["fail"];
        }
        if(Number(score) > Number(this.highestScore) ){
            this.highestScore=score;
            //transfer All NAS to address
            var result = Blockchain.transfer(Blockchain.transaction.from, this.totalAmount);
            console.log("transfer result:", result);
            if(!result){
                throw new Error("transfer fail!");
            }
            var winNumber=this.totalAmount;
            this.totalAmount=0;
            return ["win",winNumber];
        }
        return ["lose"];
    }

};
module.exports = WinTheCoinContract;
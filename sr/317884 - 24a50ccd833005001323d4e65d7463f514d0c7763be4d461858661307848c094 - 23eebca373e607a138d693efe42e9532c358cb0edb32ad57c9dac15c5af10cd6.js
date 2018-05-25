"use strict";

var NasLove = function () {
    LocalContractStorage.defineProperty(this, "owner");
    LocalContractStorage.defineMapProperty(this, "loves");
    LocalContractStorage.defineProperty(this, "size");
}

NasLove.prototype ={
    init: function(){
        this.size = 0;
    },
    say: function(fromUser,fromCity,toCity,content){
        var love = {
            fromUser:fromUser,
            fromCity:fromCity,
            toCity:toCity,
            content:content,
            timestamp: Blockchain.transaction.timestamp,
            txhash:Blockchain.transaction.hash,
        };
        var index = this.size;
        this.loves.set(index, love);
        this.size +=  1;
    },


    getOne:function(hash){
        for (var i=0;i<this.size;i++){
            var love = this.loves.get(i);
            if(love.txhash == hash){
                return love;
            }
        }
    },



    getAll : function () {
        var result = Array();
        for (var i = 0; i < this.size; i++) {
            var love = this.loves.get(i);
            result.push(love);
        }

        return result;

    }

}

module.exports = NasLove;

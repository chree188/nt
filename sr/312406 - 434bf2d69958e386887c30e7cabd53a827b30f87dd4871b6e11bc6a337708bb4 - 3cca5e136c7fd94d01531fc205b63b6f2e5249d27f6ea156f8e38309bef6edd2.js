"use strict";
//testnet:n1ebHyDTHdpkEs6KmeoMh1WgzEiHRYeX6L8
//testndthast: e2be6a42ce2830ca9528c8293453cd6548406b915261c1266dc9f8a5a0ead937
//localaddress:n1jcNgYBZq7VCGeeb2Ch9EfBePLvHrU4EQB
//localhash:426d721e1c606cb92f8333fc8dac84c3c820e2dd98cd503f90fc6ef81d40a892
var NasAgree = function () {
    LocalContractStorage.defineProperty(this, "owner");
    LocalContractStorage.defineMapProperty(this, "agreements");
    LocalContractStorage.defineProperty(this, "size");
}

// var Agree = function(text){
//     if(text){
//         var o = JSON.parse(text);
//         this.balance = new BigNumber(o.balance);//余额信息
//         this.address = o.address;
//     }else{
//         this.balance = new BigNumber(0);
//         this.address = "";
//     }
// }
NasAgree.prototype ={
    init: function(){
        this.size = 0;
    },
    create: function(text,reserve=""){
        var agreement = {
            txhash:Blockchain.transaction.hash,
            text:text,
            signer1: Blockchain.transaction.from,
            reserve:reserve,
            signer2:""
        };
        var index = this.size;
        this.agreements.set(index, agreement);
        // console.log(this.agreements);
        // console.log(this.agreements.get(index));
        this.size +=  1;
    },


    getOne:function(hash){
        for (var i=0;i<this.size;i++){
            var agreement = this.agreements.get(i);
            console.log(agreement);
            if(agreement.txhash == hash){
                return agreement;
            }
        }
    },

    getIndexByHash:function(hash){
        for (var i=0;i<this.size;i++){
            var agreement = this.agreements.get(i);
            console.log(agreement);
            if(agreement.txhash == hash){
                return i;
            }
        }
    },

    sign:function(hash){
        var index = this.getIndexByHash(hash);
    //    var agreement = this.getOne(hash);
    //     var agreement = this.agreements.get(index);
        var agreement = this.copy(this.agreements.get(index));
        console.log("before");
        console.log(agreement);
        console.log(this.agreements);

        if(agreement){
            if(!agreement.signer2 && (!agreement.reserve || agreement.reserve == Blockchain.transaction.from)){
                agreement.signer2 = Blockchain.transaction.from;
                this.agreements.put(index,agreement);
                this.agreements.get(index).signer2 = Blockchain.transaction.from;
                console.log("after");
                console.log(this.agreements.get(index));
                console.log(agreement);
                console.log(this.agreements);

            }else{
                throw new Error("Error: Already signed by "+agreement.signer2);
            }
        }
    },

    copy :function(obj){
        var newobj = {};
        for ( var attr in obj) {
            newobj[attr] = obj[attr];
        }
        return newobj;
    },

    getAllSigned : function () {
        var result = Array();
        for (var i = 0; i < this.size; i++) {
            var agreement = this.agreements.get(i);
            if (agreement.signer1 && agreement.signer2) {
                result.push(agreement);
            }
        }

        return result;

    }

}

module.exports = NasAgree;

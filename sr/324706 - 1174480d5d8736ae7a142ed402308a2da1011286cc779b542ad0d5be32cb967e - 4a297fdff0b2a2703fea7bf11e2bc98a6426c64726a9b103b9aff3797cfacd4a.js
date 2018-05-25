'use strict';

var NebulasSodukuContract = function() {

    LocalContractStorage.defineMapProperty(this, "GameRecord");
    LocalContractStorage.defineMapProperty(this, "Account");

};

NebulasSodukuContract.prototype = {
    init: function() {
        var initdetail = {
            namearray: ["liuchuang","zhan","lisi","wangwu","zhanliu","liqi","wangba","zhaniu","lishi","liushi","liuchuang","zhan","lisi","wangwu","zhanliu","liqi","wangba","zhaniu","lishi","liushi"],
            addressarray:["n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq","n1sM6nEpJHct8uDmU799t73apo1sS5RLffq"],
            scorearray:[5,5,4,4,3,3,2,2,1,1,5,5,4,4,3,3,2,2,1,1]
        }
        this.GameRecord.set("record",initdetail);
    },

    initAccount: function(name){
        var fromaddress = Blockchain.transaction.from;
        if (name.length>9||name.length<4||name.length == 0||name == ""){
            return 0;
        }else{
            var detail = {
                accountname: name,
                accountscore: 0,
                accountaddress:fromaddress,
            };
            this.Account.set(fromaddress, detail);
        }
    },

    addScore:function(score){
        var fromaddress = Blockchain.transaction.from;

        var account = this.Account.get(fromaddress);
        var newscore = account.accountscore + score;

        var detail = {
            accountname: account.accountname,
            accountscore: newscore,
            accountaddress:fromaddress,
        };
        this.Account.set(fromaddress, detail);
    },

    searchAccount: function(){
        var fromaddress = Blockchain.transaction.from;
        var account = this.Account.get(fromaddress);
        return account;
    },


    updategamerecord: function() {
        var fromaddress = Blockchain.transaction.from;
        var account = this.Account.get(fromaddress);

        var name = account.accountname;
        var fromaddress = Blockchain.transaction.from;
        var score = account.accountscore;


        var gamerecord = this.GameRecord.get("record");


        var oldnamearray = gamerecord.namearray;
        var oldaddressarray = gamerecord.addressarray;
        var oldscorearray = gamerecord.scorearray;


        var len = 20;
        for (var i = 0; i < len; i++) {
            if (score >= oldscorearray[i]){
                for (var j = 19 ; j >= i+1 ; j--){
                    oldscorearray[j] = oldscorearray[j-1];
                    oldnamearray[j] = oldnamearray[j-1];
                    oldaddressarray[j] = oldaddressarray[j-1];
                }
                oldscorearray[i] = score;
                oldnamearray[i] = name;
                oldaddressarray[i] = fromaddress;
                break;
            }
        }


        var updatedetail = {
            namearray:oldnamearray,
            addressarray:oldaddressarray,
            scorearray:oldscorearray
        }

        this.GameRecord.set("record",updatedetail);

        return 1;

    },


    serachgamerecordList: function() {

        var gamerecord = this.GameRecord.get("record");

        var result = {
            record:gamerecord,
        };

        return result;
    },
};

module.exports = NebulasSodukuContract;
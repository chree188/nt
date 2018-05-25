'use strict';

var NebulasSnakeContract = function() {

    LocalContractStorage.defineMapProperty(this, "GameRecord");

};

NebulasSnakeContract.prototype = {
    init: function() {
        var initdetail = {
            namearray: ["liuchuang","zhan","lisi","wangwu","zhanliu","liqi","wangba","zhaniu","lishi","liushi"],
            addressarray:["","","","","","","","","",""],
            scorearray:[5,5,4,4,3,3,2,2,1,1]
        }
        this.GameRecord.set("slow",initdetail);
        this.GameRecord.set("normal",initdetail);
        this.GameRecord.set("fast",initdetail);
    },


    addgamerecord: function(level,gamerecord) {
        //["level",{"name":"","score":""}]

        var name = gamerecord.name;
        var fromaddress = Blockchain.transaction.from;
        var score = gamerecord.score;

        if (name.length>9||name.length<4||name.length == 0||name == ""){
            return 0;
        }
        if ( score < 0){
            return 0;
        }
        else{
            var levelgamerecord = this.GameRecord.get(level);


            var oldnamearray = levelgamerecord.namearray;
            var oldaddressarray = levelgamerecord.addressarray;
            var oldscorearray = levelgamerecord.scorearray;


            var len = 10;
            for (var i = 0; i < len; i++) {
                if (score >= oldscorearray[i]){
                    for (var j = 9 ; j >= i+1 ; j--){
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

            this.GameRecord.set(level,updatedetail);

            return 1;
        }
    },


    serachgamerecordList: function() {

        var slowlevelgamerecord = this.GameRecord.get("slow");
        var normallevelgamerecord = this.GameRecord.get("normal");
        var fastlevelgamerecord = this.GameRecord.get("fast");

        var result = {
            slowrecord:slowlevelgamerecord,
            normalrecord:normallevelgamerecord,
            fastrecord:fastlevelgamerecord
        };

        return result;
    },
};

module.exports = NebulasSnakeContract;
'use strict';


//记录一个nicknam即可
var Chick = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;
        this.nickName = obj.nickName;
        this.content = obj.content;
        this.timewrote =obj.timewrote;
    } else {
        this.address = "";
        this.nickName = "";
        this.content = "";
        this.timewrote="";
    }
};

Chick.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var AngryChickContract = function() {
    LocalContractStorage.defineProperty(this, "chicksNumber");
    LocalContractStorage.defineMapProperty(this, "historyChicks", {
        parse: function(jsonText) {
            return new Chick(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

AngryChickContract.prototype = {
    init: function() {
        this.chicksNumber = 0;
    },
    roar: function(nickName,content) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        if(content.length>10240){
            throw new Error("You should write less than 10k characters.");
        }
        var chick = new Chick();
        chick.address = from;
        chick.nickName = nickName;
        chick.content = content;
        chick.timewrote = new Date();
        this.chicksNumber++;
        this.historyChicks.put(this.chicksNumber, chick);
    },
    //get participants count
    getProgress: function() {
        return this.chicksNumber;
    },
    //last chick content
    getLastWinnerBidNumber: function() {
        return this.lastWinnerBidNumber;
    },
    //history chicks
    getHistoryChicks: function(from,to) {
        if(from<=0){from=1;}
        if(to>this.chicksNumber){to=this.chicksNumber;}
        var history = [];
        for (var i = from; i <= to; i++) {
            var object = this.historyChicks.get(i);
            //result += object + "\r\n";
            history.push(object);
        }
        return {"count":this.chicksNumber,"history":history};
    },
    
};

module.exports = AngryChickContract;
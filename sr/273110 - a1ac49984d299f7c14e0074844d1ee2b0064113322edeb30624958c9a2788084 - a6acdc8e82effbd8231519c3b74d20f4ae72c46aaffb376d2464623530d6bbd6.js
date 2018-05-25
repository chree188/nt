"use strict";

var VoteForLove = function () {
    LocalContractStorage.defineMapProperty(this,"voteState");
    LocalContractStorage.defineMapProperty(this,"nameArray");
    LocalContractStorage.defineProperty(this,"size");
    LocalContractStorage.defineProperty(this,"numOfWho");
    LocalContractStorage.defineMapProperty(this,"log");
};

VoteForLove.prototype = {
    init: function () {
        this.size=0;
        this.numOfWho=0;
    },
    len: function() {
        return this.size;
    },
    add: function (name) {
        name = name.trim();
        if (name === ""){
            throw new Error("empty name");
        }
        if (name.length > 64 ){
            throw new Error("name exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var voteNum = this.voteState.get(name);
        if (voteNum){
            throw new Error("name has been occupied");
        }
        var oneLog={"from":from,"act":"add","name":name};
        this.voteState.set(name,0);
        this.nameArray.set(this.numOfWho,name);
        this.log.set(this.size,oneLog);
        this.numOfWho+=1;
        this.size +=1;
        return JSON.stringify(oneLog);
    },

    getOne: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        var voteNum = this.voteState.get(name);
        return voteNum;
    },
    getAll: function () {
        var ret=[];
        for (var i=0;i<this.numOfWho;i++)
        {
            var name=this.nameArray.get(i);
            var num=this.voteState.get(name);
            ret.push([name,num]);
        }
        return JSON.stringify(ret);
    },
    vote: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        var voteNum = this.voteState.get(name);
        voteNum+=1;
        this.voteState.set(name,voteNum);
        var from = Blockchain.transaction.from;
        var oneLog={"from":from,"act":"vote","name":name,"num":voteNum};
        this.log.set(this.size,oneLog);
        this.size +=1;
        return JSON.stringify(oneLog);
    },
    seeLogs:function() {
        var logs=[];
        for (var i=0;i<this.size;i++)
        {
            logs.push(this.log.get(i));
        }
        return JSON.stringify(logs);
    }
};
module.exports = VoteForLove;
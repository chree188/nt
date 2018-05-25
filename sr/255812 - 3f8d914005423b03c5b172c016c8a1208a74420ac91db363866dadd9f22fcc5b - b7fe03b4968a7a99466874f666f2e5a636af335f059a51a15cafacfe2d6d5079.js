'use strict';

var Score = function(text){
    if (text) {
        var obj = JSON.parse(text);
        this.level = obj.level;
        this.mintime = obj.mintime;
    }else{
        this.level = 1;
        this.mintime = 0;
    }
};

Score.prototype = {
    toString:function(){
        return JSON.stringify(this);
    }
};


//消息管理类
var ScoreManager = function(){
    //存储玩家最高分数
    LocalContractStorage.defineMapProperty(this,"playerScore");

    //全球最高分
    LocalContractStorage.defineMapProperty(this,"scoreRecord");

    LocalContractStorage.defineMapProperty(this,"maxLevel");
    this.mywallet = "n1ZzbPVwHsSxdB98oqp2ps9rF5hNzFV3AzX";
};

ScoreManager.prototype = {
    init:function(){
        // this.size = 0;
        //存储size
        // maxLevel.put("0",1);
        
    },
    donate:function(){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if(Blockchain.transfer(this.mywallet,value)){
            return 0;
        }else{
            return -1;
        }
    },
    submitScore:function(level,mintime){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var score = new Score();
        score.level = parseInt(level);
        score.mintime = parseInt(mintime);
        this.playerScore.put(from,score);
        if (!this.scoreRecord.get(level)) {
            this.scoreRecord.put(level,mintime);
            this.maxLevel.put("0",level);
        };
        if(Blockchain.transfer(this.mywallet,value)){
            return 0;
        }else{
            return -1;
        }
    },
    getScore:function(level){
        var mintime = this.scoreRecord.get(level);
        if (mintime) {
            return mintime;
        }else{
            return 0;
        }
    },
    getMaxLevel:function(){
        var max = maxLevel.get("0");
        if (max) {
            return max;
        }else
        return 0;
    },
};

module.exports = ScoreManager;


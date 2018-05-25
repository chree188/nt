"use strict";
function safeAdd(x, y) {
    var lsw = (x & 0xffff) + (y & 0xffff);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
}

var Game = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.last = obj.last
        this.balance =obj.balance;
    } else {
        this.last = null;
        this.balance = 0;
    }
};

Game.prototype = {
toString: function() {
    return JSON.stringify(this);
}
};



var GameDB = function () {
    LocalContractStorage.defineProperties(this,{
                                          isOpen: null,
                                          admAdd: null,
                                          gameid: null,
                                          balance: null,
                                          timestamp: null,
                                          last: null,
                                          rnow: null,
                                          diff:null,
                                          counter:null
                                          });
    
    LocalContractStorage.defineMapProperty(this, "game", {
        parse: function (text) {
            return new Game(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

GameDB.prototype = {
    init: function () {
        this.admAdd="n1NJaHRXpe49fc98GtuxxYVFyq1xsYCHx9d";
        this.isOpen = true;
        this.balance = new BigNumber(0);
        this.gameid = 0;
        this.timestamp = 0;
        this.last = null;
        this.rnow = 0;
        this.diff = 0;
        this.counter =0;
        var gametoutie = new Game();
        this.game.put(0, gametoutie);
        
    },
    //view 拿信息
    
    getIsOpen: function() {
        return this.isOpen;
    },
    
    
    getAdminAddress: function() {
        return this.admAdd;
    },
    


    //设置开始
    setIsOpen: function(isopen) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.isOpen = isopen;
        } else {
            throw new Error("Admin only");
        }
    },
 
 //铁头娃加入比赛，重置1小时倒计时
addlife: function(){
    var from = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;
   var bvalue = new BigNumber(Blockchain.transaction.value);
    if (value < 0.0001) {
        throw new Error("not enough money");
    }
    var now = new Date().getTime();
    if(this.timestamp != 0){
        this.diff = now - this.timestamp;
        
        if(this.diff < 3600* 1000){
            this.timestamp = now;
            this.last = from;
            
            if(this.counter==7){
                this.counter = this.counter -7;
                var backmoney = new BigNumber(0.0001);
                var bresult = Blockchain.transfer(this.last, backmoney.times(0.99));
                if (!bresult) {
                    Event.Trigger("awardtransferfailde", {
                                  Transfer: {
                                  from: Blockchain.transaction.to,
                                  to: this.last,
                                  value: this.balance
                                  }
                                  });
                    throw new Error("award failed");
                }
                
            }else{
                this.balance = bvalue.add(this.balance);
                
                var trysave = this.game.get(0);
                trysave.last = this.last;
                trysave.balance = this.balance;
                
                this.game.set(0,trysave);
            }
           
            this.counter++;
            
        }else{
            
            throw new Error("上一场游戏已经结束，请点击清盘~");
        
        }
        
    }else{
        this.timestamp = now;
        this.last = from;
       
        this.balance = bvalue.add(this.balance);
        
        var trysave = this.game.get(0);
        trysave.last = this.last;
        trysave.balance = this.balance;
        
        this.game.set(0,trysave);
        
    }
},
    
    
//    var nnow = new Date().getTime();
//    this.rnow = nnow;
//    if(this.timestamp!=0){
//    if ( (nnow -this.timestamp ) < 30*1000 && this.last != null)
//    {
//
//          this.claimwin();
//
//    }else{
//        throw new Error("time not good");
////        this.timestamp = nnow;
////        this.last = from;
////        var bvalue = new BigNumber(Blockchain.transaction.value);
////        this.balance = bvalue.add(this.balance);
////
//
//    }
//
//    }else{
//        this.timestamp = nnow;
//        this.last = from;
//        var bvalue = new BigNumber(Blockchain.transaction.value);
//        this.balance = bvalue.add(this.balance);
//
//
//    }
    
donate:function(){
    var bvalue = new BigNumber(Blockchain.transaction.value);
    this.balance = bvalue.add(this.balance);
    
    var trysave = this.game.get(0);
    trysave.last = this.last;
    trysave.balance = this.balance;
    
    this.game.set(0,trysave);
    
},
    
claimwin:function(){
    var now = new Date().getTime();
    this.rnow = now;
    if ( (now -this.timestamp ) >= 3600 *1000 && this.last != null)
    {
        var tvalue = new BigNumber(this.balance);
           var result = Blockchain.transfer(this.last, tvalue.times(0.99));
            this.balance = tvalue.times(0.01);
        if (!result) {
            Event.Trigger("Wintransferfailed", {
                          Transfer: {
                          from: Blockchain.transaction.to,
                          to: this.last,
                          value: this.balance
                          }
                          });
            throw new Error("Claimwin failed");
        }
        
        var savegame = new Game();
        savegame.id =this.gameid;
        savegame.last = this.last;
        this.game.put(this.gameid, savegame);
        this.gameid ++;
        this.last =null;
        this.timestamp= 0;
        
        var trysave = this.game.get(0);
        trysave.last = this.last;
        trysave.balance = this.balance;
        
        this.game.set(0,trysave);
        
    }else{
          throw new Error("not win yet");
    }
    
    },
    
    getBalance: function(){
        return this.balance;
    },
getLast: function(){
    return this.last;
},
getTimeStamp: function(){
    return this.timestamp;
},
    
    
getrnow: function(){
    return this.rnow;
},
    
getdiff: function(){
    return this.diff;
},
    
 
    getGame: function (id) {
        id = id.trim();
        if ( id === "" ) {
            throw new Error("empty key")
        }
        return this.game.get(id);
    }
};
module.exports = GameDB;


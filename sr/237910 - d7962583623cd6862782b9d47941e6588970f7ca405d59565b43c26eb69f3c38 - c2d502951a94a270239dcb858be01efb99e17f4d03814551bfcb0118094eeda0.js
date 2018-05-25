"use strict";

var DepositeContent = function (text) {
 if(text){
        var o = JSON.parse(text);
        this.porkPoint = parseInt(o.porkPoint);
        this.gameResult = parseInt(o.gameResult);
        this.balance = o.balance;
        this.address = o.address;
 }else{
        this.porkPoint = 0;
        this.gameResult = 0;
        this.address = "";
        this.balance = 1000;
        }
};

DepositeContent.prototype = {
 toString: function () {
  return JSON.stringify(this);
 }
};

var GameContent = function (text) {
 if(text){
        var o = JSON.parse(text);
        this.time = o.time;
        this.gameSize = parseInt(o.gameSize);
        this.user = o.user;
 }else{
        this.time = "";
        this.gameSize = parseInt(0);
        this.user = "";
        }
};

GameContent.prototype = {
 toString: function () {
  return JSON.stringify(this);
 }
};


var BankVaultContract = function () {
 LocalContractStorage.defineMapProperty(this, "bankVault", {
  parse: function (text) {
   return new DepositeContent(text);
  },
  stringify: function (o) {
   return o.toString();
  }
 });
  LocalContractStorage.defineProperty(this, "banker");
  LocalContractStorage.defineProperty(this, "gameCounter");
  LocalContractStorage.defineMapProperty(this, "gameVault",{
   parse: function (text) {
    return new GameContent(text);
   },
   stringify: function (o) {
    return o.toString();
   }
  });
};

BankVaultContract.prototype = {
      init: function (from) {
         this.banker = from;
         this.gameCounter = 0;
         var deposit = new DepositeContent();
         deposit.address = from;
         this.bankVault.put(from,deposit);
     },

      game:function(subscript){
                //subscript为抽牌序号，bet为下注金额
                var from = Blockchain.transaction.from;//玩家用户地址
                var value = Blockchain.transaction.value;
                var to = this.banker;//庄家地址


                var orig_deposit = this.bankVault.get(from);
                if (!orig_deposit){
                  var deposit = new DepositeContent();
                  deposit.address = from;
                  this.bankVault.put(from,deposit);
                }
                var cur_deposit = this.bankVault.get(from);
                var bank_deposit = this.bankVault.get(this.banker);
                var gameResult = 0;
                var porkPoint = 0;

                //抽牌过程
                var arr =[1,2,3,4,5,6,7,8,9,10,11,12,13];
                for(var i = 0;i < arr.length; i++){
                  var rand = parseInt(Math.random()*arr.length);
                  var t = arr[rand];
                  arr[rand] =arr[i];
                  arr[i] = t;
                }
                
                if(parseInt(subscript)<14&&parseInt(subscript)>0){
                  porkPoint = arr[parseInt(subscript)-1];
                }else{
                  throw new Error("No sufficient subscript.");
                }

                var bankPoint = arr[7];
                //玩下注 结算通过筹码 单人玩法
                if(porkPoint>bankPoint){
                   gameResult = 1;
                   cur_deposit.balance += 10;
                   bank_deposit.balance -= 10;
                   bank_deposit.porkPoint = bankPoint;
                   this.bankVault.put(from,cur_deposit);
                   this.bankVault.put(to,bank_deposit);
                 }else if(porkPoint==bankPoint){
                   gameResult = 0;
                   bank_deposit.porkPoint = bankPoint;
                   this.bankVault.put(from,cur_deposit);
                   this.bankVault.put(to,bank_deposit);
                 }else{
                   gameResult = -1;
                   cur_deposit.balance -= 10;
                   bank_deposit.balance += 10;
                   bank_deposit.porkPoint = bankPoint;
                   this.bankVault.put(from,cur_deposit);
                   this.bankVault.put(to,bank_deposit);
                 }

                 //存储中间结果
                 var deposit = this.bankVault.get(from);
                 deposit.porkPoint = porkPoint;
                 deposit.gameResult = gameResult;
                 deposit.address = from;
                 this.bankVault.put(from, deposit);

                 var gameArray = new Array();
                 gameArray.push(deposit.toString());
                 gameArray.push((this.bankVault.get(to)).toString());

                 var gameDeposit = new GameContent();
                 gameDeposit.user = gameArray.join(",");
                 gameDeposit.gameSize = 2;

                 var d = new Date();
                 gameDeposit.time = d.toString();
                 this.gameVault.put(this.gameCounter,gameDeposit);
                 this.gameCounter += 1;

        },

        //兑换筹码
        save: function () {
          var from = Blockchain.transaction.from;
          var deposit = this.bankVault.get(from);
          deposit.balance += 100;
          this.bankVault.put(from,deposit);
        },

        porkPointOf: function () {
          var from = Blockchain.transaction.from;
          return this.bankVault.get(from);
        },

        gameOf: function () {
          var infArray = new Array();
          for(var i = 0;i < this.gameCounter;i++){
            infArray.push(this.gameVault.get(i));
          }
          return infArray.join(",");
        }

};

module.exports = BankVaultContract;

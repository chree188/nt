'use strict';
var WontonContract = function () {
  //userId=>balance
  //userId=>address
    LocalContractStorage.defineMapProperty(this, "address");   //玩家钱包地址  userId=>address
    LocalContractStorage.defineMapProperty(this, "balance");   //余额(体积) userId => balance
  //  LocalContractStorage.defineMapProperty(this, "name");      //昵称(后期加)
    LocalContractStorage.defineProperty(this, "_owner");      //项目方地址
    LocalContractStorage.defineProperty(this, "_srWallet");   //监督方地址
    LocalContractStorage.defineProperty(this, "_fundWallet"); //基金会地址
    LocalContractStorage.defineProperty(this, "_fundValue");  //基金会币量
    LocalContractStorage.defineProperty(this, "candyValue");  //糖果参数
    LocalContractStorage.defineProperty(this, "candyCloseValue");  //停止糖果阀值
    LocalContractStorage.defineProperty(this, "candyCloseSwitch");  //糖果开关
    LocalContractStorage.defineProperty(this, "feeRate");
 };

 WontonContract.prototype = {
     init: function () {
         this._owner = "n1Rz6h1bz1ZVnKkBJipeRztxzyYJMqPy6Gg";
         this._srWallet = "n1TTDvp8GCHSa7HByqypnf2ghsqveDnrduS";
         this._fundWallet = "n1YkRrReTz9SR5V1WVT84hfxovnMNHyTcmg";
         this._fundValue = 0;  //调用initFundValue函数 初始化
         this.candyValue = 0;
         this.candyCloseValue = 1000000000000000000; //10 需要转化成wei  //!!测试期间调为1NAS
         this.candyCloseSwitch = true;
         this.feeRate = 4;                      //需要改
     },

     // getUser: function(_userAddress){

     //   var userResult = "";
     //   userResult = this.balance.get(_userAddress) + "," + this.name.get(_userAddress);
     //   return userResult;

     // },
     initFundValue:function() {
       if(Blockchain.transaction.from == this._fundWallet){
         this._fundValue += Blockchain.transaction.value;
       }
     },

     getBalance: function(_userId){      //后端调用,考虑加上项目方权限.

       return this.balance.get(_userId);

     },

     // getName: function(){

     //   return this.name.get(Blockchain.transaction.from);

     // },

     addUser: function(_userId){

       if(this.balance.get(_userId) == null || this.balance.get(_userId) == 0){
         if(Blockchain.transaction.value >= 100000000000000000){
           this.address.set(_userId, Blockchain.transaction.from);
           this.balance.set(_userId, 100000000000000000);
           //!!加事件,返回转账结果,前端加载页面.
         }


       }else{

         Blockchain.transfer(Blockchain.transaction.from, Blockchain.transaction.value);
       }
     },

     eatCandy:function(_candyMass, _userId){            //_candyMass 默认为1,代表0.01 NAS
       if(Blockchain.transaction.from == this._owner){
         var value = this.balance.get(_userId) + _candyMass * 10000000000000000;  //0.01 NAS
         this.balance.set(_userId, value);
         this._fundValue -= _candyMass * 10000000000000000;
       }
     },

     wonton: function(_eatenSize, _foodUserId, _eaterUserId){         //_eatenSize 需要适配 传入 10 代表 0.1 NAS
       if(Blockchain.transaction.from == this._owner){
         var fee = _eatenSize * 10000000000000000 / this.feeRate;
      // var fee = this.balance.get(_foodAddr) / this.feeRate;
         var toned = this.balance.get(_eaterUserId) + _eatenSize * 10000000000000000 - fee;
         this.balance.set(_eaterUserId, toned);
         this._fundValue += fee;
         var foodRemain = this.balance.get(_foodUserId) - _eatenSize * 10000000000000000;
         this.balance.set(_foodUserId, foodRemain);
         if(this.balance.get(_foodUserId) <= 0){
           this.balance.set(_foodUserId, null);
         }

        //Event 事件
        //  Event.Trigger("wonton", {
        //     Wonton: {
        //         foodAddr: _foodAddr,
        //         eaterAddr: _eaterAddr,
        //         toned: toned
        //     }
        // }
       }
     },

     // loss:function(_lossUser){      //传入数组;   后期升级加上
     //   if(Blockchain.transaction.from == this._owner){
     //     for(var i = 0; i < _lossUser.length; i++){
     //       var loss = this.balance.get(_lossUser[i]) / 300;
     //       var lossed = this.balance.get(_lossUser[i]) - loss;
     //       this.balance.set(_lossUser[i], lossed);
     //       this._fundValue += loss;
     //     }
     //   }
     // },

     getCandyBool: function(){
         if (this._fundValue / 3 < this.candyCloseValue || this.candyCloseSwitch == false){

           return false;

         }else{

           return true;
         }
     },

     withdraw:function(_userId){                    //前端调用,后端检测也行
         var fee = this.balance.get(_userId) / (this.feeRate * 10);
         var value = this.balance.get(_userId) - fee;
         this._fundValue += fee;
         Blockchain.transfer(this.address.get(_userId), value);
     },

     getFundValue:function(){
       if(Blockchain.transaction.from == this._srWallet){
         return this._fundValue;
       }
     },

     setCandyCloseSwitch:function(_candyCloseBool){
       if(Blockchain.transaction.from == this._srWallet){
         this.candyCloseSwitch = _candyCloseBool;
       }
     },

     setFeeRate:function(_feeRate){
       if(Blockchain.transaction.from == this._srWallet){
         this.feeRate = _feeRate;
       }
     },

     setFundValue:function(_fundValue){
       if(Blockchain.transaction.from == this._srWallet){
         this._fundValue = _fundValue;
       }
     },

     circulation:function(_value){
       if(Blockchain.transaction.from == this._srWallet){
         Blockchain.transfer(this._fundWallet, _value);
         this._fundValue -= _value;
         return this._fundValue;
       }
     }

     // kill:function(){
     //   if(Blockchain.transaction.from == this._srWallet){
     //     Blockchain.transfer(this._fundWallet, _value);
     //   }
     // }

 };

 module.exports = WontonContract;

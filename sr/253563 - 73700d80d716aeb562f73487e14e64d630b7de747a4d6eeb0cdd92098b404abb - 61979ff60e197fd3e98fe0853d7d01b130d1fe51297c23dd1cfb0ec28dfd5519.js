'use strict';


 // 定义一个Estate合约
var Estate = function () {

    //模拟 方块 结构体
    LocalContractStorage.defineMapProperties(this,{
      owner:   null,        //定义owner字典
      message: null,        //定义message 字典
      price:   null,        //定义 价格 字典
      isSale:  null,        //定义 是否售出 字典
      colors:  null         //定义 颜色 字典
    });

    //定义 bool类型
    LocalContractStorage.defineProperty(this, "isMessageEnabled");
    //定义 地产总数 常量
    LocalContractStorage.defineProperty(this, "numberOfEstate"); //init 100
    LocalContractStorage.defineProperty(this, "width"); //init 100
    LocalContractStorage.defineProperty(this, "feeRate"); //init 50
    LocalContractStorage.defineProperty(this, "_owner"); //init 钱包地址
    LocalContractStorage.defineProperty(this, "_fundWallet"); //init 基金会地址
    LocalContractStorage.defineProperty(this, "_defaultWeiPrice"); //init 100000000000000 1nas

 };

 Estate.prototype = {
       //  初始化
     init: function () {
         this.isMessageEnabled = true;
         this.numberOfEstate = 100;
         this.width = 10;
         this.feeRate = 50;
         this._owner = "n1NPrqHvmdzW97AmDzr1xtKcSKvQJgMCzH1";
         this._fundWallet = "n1PPTW6rSsAXp9DPDNtEvZFEVEB8BU1i1Li";
         this._defaultWeiPrice = 100000000000000;
     },
      //获取房产数据
     getEstate: function(_estateNumber){
       if(this.owner.get(_estateNumber) == null) {
         this.owner.set(_estateNumber, this._fundWallet);
         this.message.set(_estateNumber, "");
         this.price.set(_estateNumber, this._defaultWeiPrice);
         this.isSale.set(_estateNumber, true);
       }else {

       }
       var estateResult = "";
       estateResult = this.owner.get(_estateNumber)+","+this.message.get(_estateNumber)+","+this.price.get(_estateNumber)+","+this.isSale.get(_estateNumber);

       return estateResult;
     },

     getColors: function(){
       var colorsResult = "";
       for (var i = 0; i < this.numberOfEstate; i++){
         if (this.colors.get(i) == null){
           if (i == 0) {
             colorsResult += "0";
           }else {
             colorsResult += "," + "0";
           }
         }else{
           if (i == 0) {
             colorsResult += this.colors.get(i);
           }else {
             colorsResult += "," + this.colors.get(i);
           }
         }

       }

       return colorsResult;
     },

     getEstateNumber: function(_x, _y) {
       return _x + _y * this.width;
     },

     getColor: function(_red, _green, _blue) {
       return _red*65536 + _green*256 + _blue;
     },

     pay: function(_x, _y, _colorRed, _colorGreen, _colorBlue) {
       var estateNum = this.getEstateNumber(_x, _y);
       var color = this.getColor(_colorRed, _colorGreen, _colorBlue);
       this.buyEstate(estateNum, color, "");
     },

     buyEstate:function(_estateNum, _color, _message) {
       if (_estateNum < this.numberOfEstate){
         if (Blockchain.transaction.value != 0){
           if(this.owner.get(_estateNum) == null) {
             this.owner.set(_estateNum, this._fundWallet);
             this.message.set(_estateNum, "");
             this.price.set(_estateNum, this._defaultWeiPrice);
             this.isSale.set(_estateNum, true);
           }
           var currentOwner = this.owner.get(_estateNum);
           var currentPrice = this.price.get(_estateNum);
           var currentSaleState = this.isSale.get(_estateNum);

           if (currentSaleState == true){
             if (currentPrice <= Blockchain.transaction.value){
               var fee = Blockchain.transaction.value / this.feeRate;
               Blockchain.transfer(currentOwner, Blockchain.transaction.value - fee);
               Blockchain.transfer(this._fundWallet, fee);
               this.owner.set(_estateNum, Blockchain.transaction.from);
               this.message.set(_estateNum, _message);
               this.price.set(_estateNum, currentPrice);
               this.isSale.set(_estateNum, false);
               this.colors.set(_estateNum, _color);
             }
           }

         }
       }
     },

     setOwner: function(_estateNum, _owner) {
       if (Blockchain.transaction.from == this.owner.get(_estateNum)){
         if (_owner != null){
           this.owner.set(_estateNum, _owner);
         }
       }
     },
     setColor:function(_estateNum, _color) {
       if (Blockchain.transaction.from == this.owner.get(_estateNum)){
         this.colors.set(_estateNum, _color);
       }
     },
     setMessage: function(_estateNum, _message) {
       if(this.isMessageEnabled == true){
         if (Blockchain.transaction.from == this.owner.get(_estateNum)){
           this.message.set(_estateNum, _message);
         }
       }

     },
     setPrice: function(_estateNum, _weiAmount) {
       if (Blockchain.transaction.from == this.owner.get(_estateNum)){
         this.price.set(_estateNum, _weiAmount);
       }
     },
     setSaleState: function(_estateNum, _isSale) {
       if (Blockchain.transaction.from == this.owner.get(_estateNum)){
         this.isSale.set(_estateNum, _isSale);
       }
     },

     deleteMessage: function(_estateNum) {
       if (Blockchain.transaction.from == this._owner){
         this.message.set(_estateNum, "");
       }
     },
     setMessageStatus:function(_isMesssageEnabled) {
       if (Blockchain.transaction.from == this._owner){
         this.isMessageEnabled.set(_isMesssageEnabled);
       }
     }


 };
 module.exports = Estate;
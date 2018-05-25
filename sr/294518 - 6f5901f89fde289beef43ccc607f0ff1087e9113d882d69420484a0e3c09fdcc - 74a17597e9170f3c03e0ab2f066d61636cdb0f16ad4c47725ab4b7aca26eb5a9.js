'use strict';

// 购买记录
var BuyRecord = function(text) {
	if (text) {
    var obj = JSON.parse(text);
    this.id = obj.id;
    this.nick = obj.nick;
    this.address = obj.address;
    this.price = obj.price;
    this.time = obj.time;
	} else {
    this.id = "";
    this.nick = "";
    this.address = "";
    this.price = "";
    this.time = "";
	}
};

BuyRecord.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var KingOfNAS = function () {
  // 管理员
  LocalContractStorage.defineProperty(this, "owner");
  // 暂停标志
  LocalContractStorage.defineProperty(this, "isPause");
  // 王位初始价格
  LocalContractStorage.defineProperty(this, "basePrice"); 
  // 浮动比例
  LocalContractStorage.defineProperty(this, "floating");
  // 佣金比例
  LocalContractStorage.defineProperty(this, "tax");
  // 国王最大持续时间
  LocalContractStorage.defineProperty(this, "maxInterval");    
  // 购买计数器
  LocalContractStorage.defineProperty(this, "buyCount");
  // 购买记录
  LocalContractStorage.defineMapProperty(this, "buyRecord");
};

KingOfNAS.prototype ={
  init: function(){
    //TODO: 系统初始化
    this.owner = Blockchain.transaction.from;
    this.isPause = false;    
    this.basePrice = "500000000000000000";
    this.floating = 1.33;
    this.tax = 0.05;
    this.maxInterval = 14*24*60*60*1000;
    this.buyCount = 0;
  },
  buy: function (nick) {
    //TODO:购买王位
    if(this.isPause){
      this._refund();
      return "isPause";
    }
    var value = Blockchain.transaction.value;
    var from = Blockchain.transaction.from;
    var currentPrice = new BigNumber(this.currentPrice());
    var basePrice = new BigNumber(this.basePrice);
    if(value.lt(currentPrice)){
      this._refund();
      return "less value";
    }

    var extra = value.sub(currentPrice);
    if(extra.gt(0)){
      Blockchain.transfer(from, extra);
    }
    if(currentPrice.eq(basePrice)){
      Blockchain.transfer(this.owner,basePrice);
    }else{
      var commission = currentPrice.mul(this.tax);
      Blockchain.transfer(this.owner,commission);
      var lastBuy = this.buyRecord.get(this.buyCount);
      Blockchain.transfer(lastBuy.address,currentPrice.sub(commission));
    }

    this.buyCount++;
    var item = new BuyRecord();
    item.id = this.buyCount;
    item.nick = nick;
    item.address = Blockchain.transaction.from;
    item.price = currentPrice.toString();
    item.time = Date.now();
    this.buyRecord.set(this.buyCount,item);    
  },
  _refund: function(){    
    var value = Blockchain.transaction.value;
    var from = Blockchain.transaction.from;    
    if(value.gt(0)){
      Blockchain.transfer(from, value);
    }
  },
  currentPrice: function(){
    if(this.buyCount===0){
      return this.basePrice;
    }
    var lastBuy = this.buyRecord.get(this.buyCount);
    var timeInterval = Date.now() - lastBuy.time;
    if(timeInterval > this.maxInterval){
      return this.basePrice;      
    }
    var currentPrice = new BigNumber(lastBuy.price).mul(this.floating);
    var result = Math.floor(currentPrice / 10000000000000000) * 10000000000000000;
    return result;
  },
  info: function(){
    // TODO: 查看系统状态
    if(!this._isOwner()){
      return;
    }
    var result = {
      "isPause":this.isPause,
      "owner":this.owner,
      "basePrice":this.basePrice,
      "currentPrice":this.currentPrice(),
      "floating":this.floating,
      "tax":this.tax,
      "maxInterval":this.maxInterval,
      "buyCount":this.buyCount
    };
    return JSON.stringify(result);
  },
  pause: function(){
    //TODO: 系统暂停，仅owner
    if(!this._isOwner()){
      return;
    }
    this.isPause = true;
  },
  unpause: function(){
    //TODO: 取消系统暂停，仅owner
    if(!this._isOwner()){
      return;
    }
    this.isPause = false;
  },

  hall: function(){
    //TODO:查看国王大厅
    var result = {"buyRecord":[]};
    for(var i=1;i<=this.buyCount;i++){
      var item = this.buyRecord.get(i);
      result.buyRecord.push(item);
    }
    return JSON.stringify(result); 
  },
  _isOwner: function(){
    var result = this.owner === Blockchain.transaction.from;
    return result;
  },

};

module.exports = KingOfNAS;
'use strict';

var DepositeContent = function(text){
if(text){
  var o = JSON.parse(text);
  //this.balance = new BigNumber(o.balance);//用户账户余额
  this.address = o.address;//用户账户地址
  this.foodname = o.foodname;//用户所点菜名
  this.quantities = parseInt(o.quantities);//用户点菜数量
}
else{
  //this.balance = new BigNumber(0);
  this.address = "";
  this.foodname = "";
  this.quantities = 0;
}
};



DepositeContent.prototype = {
 toString: function(){
  return JSON.stringify(this);
 }
};







var BankVaultContract = function(){
 LocalContractStorage.defineMapProperty(this,"bankVault",{
  parse: function(text){
   return new DepositeContent(text);
  },
  stringify: function(o){
   return o.toString();
  }
 });
};



BankVaultContract.prototype = {
 init: function(){
 },

 chooseFood: function(number){
  var from = Blockchain.transaction.from;
  var numbers = parseInt(number);   //定义点菜总数量
  var foodOrder = this.bankVault.get(from);  //获取原始订单
  
  if(foodOrder){
   numbers += foodOrder.quantities;
  }
  
  var foodOrderNew = new DepositeContent();
  
  foodOrderNew.quantities = numbers;
  this.bankVault.put(from,foodOrderNew);
 },

 payOrder: function(){
  //点菜总数量
  var from = Blockchain.transaction.from;   //买家账户地址
  var deposit = this.bankVault.get(from);    //卖家账户地址
  var value = deposit.quantities * 10;//点菜总费用
  
  Event.Trigger("bankVault",{
   Transfer:{
    from: Blockchain.transaction.to,
    to: from,
    value: value.toString()
   }
  });
  return value;
 },

 
 verifyAddress: function(address){
  var result = Blockchain.verifyAddress(address);
  return{
   valid: result == 0 ? false : true
  };
 }
};


module.exports = BankVaultContract;
'use strict';

var DepositeContent = function (text) {
  if (text) {
    var o = JSON.parse(text);   
    this.balance = new BigNumber(o.balance);
    this.expiryHeight = new BigNumber(o.expiryHeight);
  } else {
    this.balance = new BigNumber(0);
    this.expiryHeight = new BigNumber(0);
  }
};

DepositeContent.prototype = {
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
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineProperty(this, "size");
   LocalContractStorage.defineProperty(this, "takeoutcount");

};

BankVaultContract.prototype = {
  init: function () {
	  this.size=0;
      this.takeoutcount = "n1FsMRiAFkT8rDyoGoF3FV2PbNUnBixLtbQ";
  }, 
  
  donate: function (height) {
    var donatecount= this.donatecount;
	var from = Blockchain.transaction.from; 
    var value = Blockchain.transaction.value;
    var bk_height = new BigNumber(Blockchain.block.height);
    

  //   sumvalue = sumvalue.plus(value);
    
   //  var deposit_donate = new DepositeContent();
	//  deposit_donate.balance = value;
   
  //  deposit_donate.expiryHeight = bk_height.plus(height);
  //  this.bankVault.put(donatecount, deposit_donate);
	
	var from = Blockchain.transaction.from;
	var valuedetail = Blockchain.transaction.value;
	var orig_deposit = this.bankVault.get(from);
    if (orig_deposit) {
      valuedetail = value.plus(orig_deposit.balance);
    }

    var deposit = new DepositeContent();
    deposit.balance = valuedetail;
    deposit.expiryHeight = bk_height.plus(height);

    this.bankVault.put(from, deposit);
	
	/////////###############
   	var index = this.size;
	var sybo=false;
	for(var i=0;i<index;i++)
	{
		var dv=this.arrayMap.get(i);
		if (dv==from)	{	
		this.dataMap.set(from, deposit.balance);
	    sybo=true;
	    break;}
		
		
	}
	if(!sybo)
	{	
       this.arrayMap.set(index, from);
        this.dataMap.set(from, deposit.balance);
        this.size +=1;
	}

	//###################
		
  },
  
    set: function (key, value) {
        var index = this.size;
       this.arrayMap.set(index, key);
        this.dataMap.set(key, value);
        this.size +=1;
    },
	
  
   takeout: function (value) {
    var takeoutcount = this.takeoutcount;
    var from = Blockchain.transaction.from;
    var bk_height = new BigNumber(Blockchain.block.height);
    var amount = new BigNumber(value);
	
	if (takeoutcount==from){

//	var deposit = this.bankVault.get(from);
 //   if (!deposit) {
 //     throw new Error("No deposit before.");
 //   }
	
   // var deposit = this.bankVault.get(donatecount);
 

  //  if (bk_height.lt(deposit.expiryHeight)) {
  //    throw new Error("Can not takeout before expiryHeight.");
  //  }

 //  if (amount.gt(deposit.balance)) {
 //     throw new Error("Insufficient balance.");
 //   }
      
    var result = Blockchain.transfer(from, amount);
    if (!result) {
      throw new Error("transfer failed.");
    }
  //   Event.Trigger("BankVault", {
 //    Transfer: {
 //       from: Blockchain.transaction.to,
 //       to: from,
 //       value: amount.toString()
 //     }
 //   });

 //   deposit.balance = deposit.balance.sub(amount);
 //   this.bankVault.put(from, deposit);
	}
  },
    balanceOf: function () {
    var from = Blockchain.transaction.from;
   // return this.bankVault.get(this.donatecount);
   var obj1=this.bankVault.get(from);
   var obj2=this.size;
  // var result ="value="+obj1+"size="+obj2;
  
	//	var type= typeof(from);
	//var dd=typeof(this.arrayMap.get(0));
	var result="from:"+typeof(from)+"___get:"+typeof(this.arrayMap.get(0));
	return result;
	
  // return this.bankVault.get(from);
   return result;
	},
	  verifyAddress: function (address) {

    var result = Blockchain.verifyAddress(address);
    return {
     valid: result == 0 ? false : true
    };
  },

   get: function (key) {
        return this.dataMap.get(key);
    },

    len:function(){
      return this.size;
    },

    forEach: function(){

        var number = this.size;
 
        var result  = "";
        for(var i=0;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
			var j=i+1;
            result += '\"Account:'+ key + ' ,Value:' +object+'Wei       \"';
        }
        return result;
    }
};

module.exports = BankVaultContract;
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

var DonateContract = function () {
  LocalContractStorage.defineMapProperty(this, "donateVault", {
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

DonateContract.prototype = {
  init: function () {
	  this.size=0;
      this.takeoutcount = "n1FsMRiAFkT8rDyoGoF3FV2PbNUnBixLtbQ";
  }, 
  
  donate: function (height) {
    var donatecount= this.donatecount;
	var from = Blockchain.transaction.from; 
    var value = Blockchain.transaction.value;
    var bk_height = new BigNumber(Blockchain.block.height);
    
	
	var from = Blockchain.transaction.from;
	var valuedetail = Blockchain.transaction.value;
	var orig_deposit = this.donateVault.get(from);
    if (orig_deposit) {
      valuedetail = value.plus(orig_deposit.balance);
    }

    var deposit = new DepositeContent();
    deposit.balance = valuedetail;
    deposit.expiryHeight = bk_height.plus(height);

    this.donateVault.put(from, deposit);
	
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


      
    var result = Blockchain.transfer(from, amount);
    if (!result) {
      throw new Error("transfer failed.");
    }
  
	}
  },
    balanceOf: function () {
    var from = Blockchain.transaction.from;

   var obj1=this.donateVault.get(from);
   var obj2=this.size;

	var result="from:"+typeof(from)+"___get:"+typeof(this.arrayMap.get(0));
	return result;
	

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

module.exports = DonateContract;
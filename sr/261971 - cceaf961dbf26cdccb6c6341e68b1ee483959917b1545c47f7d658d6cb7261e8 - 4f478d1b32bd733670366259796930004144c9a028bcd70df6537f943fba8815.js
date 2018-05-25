'use strict';
var History = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.bet = obj.bet;
		this.result = obj.result;
		this.time = obj.time;
		this.side = obj.side;
		this.odds = obj.odds;
	} else {
	    this.from = "";
	    this.bet = "";
	    this.result = "";
	    this.time = "";
	    this.side = "";
	    this.odds = "";

	}
};

var Plays = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.data = obj.data;
		this.quantity = obj.quantity;
	
	} else {
	    this.data = "";
	    this.quantity = new BigNumber(0); ;


	}
};

var DepositeContent = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.balance = new BigNumber(o.balance);
	} else {
		this.balance = new BigNumber(0);
	}
};

DepositeContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BankVaultContract = function () {
/*	LocalContractStorage.defineMapProperty(this, "", {
		parse: function (text) {
			return new Plays(text);
		},
		stringify: function (o) {
			return o.toString();
		}
	//});*/
	 LocalContractStorage.defineMapProperty(this, "amount");
};

// save value to contract, only after height of block, users can takeout
BankVaultContract.prototype = {
	init: function () {
	    var from = Blockchain.transaction.from;
	    LocalContractStorage.put("admin", from);
		var deposit = new DepositeContent();
		LocalContractStorage.put("vault", deposit);
 

	
        
	},
	play: function (arr) {
		 arr = JSON.parse(arr);
		 var sum = new BigNumber(0);
        if (!arr[0]){
            throw new Error("no information about sides");
        }

          for (var i = 0; i < arr.length; i++) {
           if (arr[i] == "true"){
          sum = sum.plus(1);
          }  		 
		} 	
	    var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var bet ;
		var remainder = 0;
		if (value.gt(50000000000000000)) { // 0.1 NAS
          bet = new BigNumber(50000000000000000);
          remainder = value.sub(bet);
		} else {
			bet = value;
		}

		
        var deposit = LocalContractStorage.get("vault");
        deposit.balance =  new BigNumber(deposit.balance);
        var history = new History();
        var  ntimeStamp = Math.floor(Date.now() / 1000);
         history.from = from;
         history.bet = bet;
         history.time = ntimeStamp;
         history.odds = sum.div(6);

     	var side = new BigNumber(Math.floor(Math.random() * 6) + 1);
     	history.side = side;
     	var total = new BigNumber(6);
   		var toPayMultiplicator = total.div(sum);
   		var toPay = new BigNumber(0);
 		this.data();

         if (bet.plus(bet).gt(deposit.balance)) throw new Error("Smart contract doesn't have enough mooney");
		if (arr[side-1] == "true") {
   			toPay = new BigNumber(Math.floor(bet * toPayMultiplicator));
		    deposit.balance = deposit.balance.sub(toPay.sub(bet));
		     toPay = new BigNumber(toPay.div(100) * 101);
		     history.result = toPay;
		    toPay = toPay.plus(remainder);
			var result =Blockchain.transfer(from, toPay);
			LocalContractStorage.set("vault", deposit);
			if (!result) {
			throw new Error("transfer failed.");
		    }
             
              var arr = LocalContractStorage.get(from);
        	  if (!arr){
         	   arr = [];
        	  } 
       		  arr.push(history);
        	  LocalContractStorage.set(from, arr);
			return "WIN payments х" + toPayMultiplicator + " side:" + side +"you got:" + toPay;
		} 

	    else { 
	    	history.result = toPay;
	       toPay = toPay.plus(remainder);
	       var result =Blockchain.transfer(from, toPay);
			LocalContractStorage.set("vault", deposit);
			if (!result) {
			throw new Error("transfer failed.");
		    }

		  deposit.balance = deposit.balance.plus(bet);
		  LocalContractStorage.set("vault", deposit);
		  
		      var arr = LocalContractStorage.get(from);
        	  if (!arr){
         	   arr = [];
        	  } 
       		  arr.push(history);
        	  LocalContractStorage.set(from, arr);

          return "FAIL payments х" + toPayMultiplicator + " side:" + side;
		}

	},
	playHard: function (arr) {
	   arr = JSON.parse(arr);
		 var sum = new BigNumber(0);
        if (!arr[0]){
            throw new Error("no information about sides");
        }

          for (var i = 0; i < arr.length; i++) {
           if (arr[i] == "true"){
          sum = sum.plus(1);
          }  		 
		} 	
	    var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var bet ;
		var remainder = 0;
		if (value.gt(50000000000000000)) { // 0.1 NAS
          bet = new BigNumber(50000000000000000);
          remainder = value.sub(bet);
		} else {
			bet = value;
		}

		
        var deposit = LocalContractStorage.get("vault");
        deposit.balance =  new BigNumber(deposit.balance);
        var history = new History();
        var  ntimeStamp = Math.floor(Date.now() / 1000);
         history.from = from;
         history.bet = bet;
         history.time = ntimeStamp;
         history.odds = sum.div(6);

     	var side = new BigNumber(Math.floor(Math.random() * 6) + 1);
     	history.side = side;
     	var total = new BigNumber(6);
   		var toPayMultiplicator = total.div(sum);
   		var toPay = new BigNumber(0);

		

         if (bet.plus(bet).gt(deposit.balance)) throw new Error("Smart contract doesn't have enough mooney");
		if (arr[side-1] == "true") {
   			toPay = new BigNumber(Math.floor(bet * toPayMultiplicator));
		    deposit.balance = deposit.balance.sub(toPay.sub(bet));
		     toPay = new BigNumber(toPay.div(100) * 99);
		     history.result = toPay;
		    toPay = toPay.plus(remainder);
			var result =Blockchain.transfer(from, toPay);
			LocalContractStorage.set("vault", deposit);
			if (!result) {
			throw new Error("transfer failed.");
		    }
             
              var arr = LocalContractStorage.get(from);
        	  if (!arr){
         	   arr = [];
        	  } 
       		  arr.push(history);
        	  LocalContractStorage.set(from, arr);
			return "WIN payments х" + toPayMultiplicator + " side:" + side +"you got:" + toPay;
		} 

	    else { 
	    	history.result = toPay;
	       toPay = toPay.plus(remainder);
	       var result =Blockchain.transfer(from, toPay);
			LocalContractStorage.set("vault", deposit);
			if (!result) {
			throw new Error("transfer failed.");
		    }

		  deposit.balance = deposit.balance.plus(bet);
		  LocalContractStorage.set("vault", deposit);
		  
		      var arr = LocalContractStorage.get(from);
        	  if (!arr){
         	   arr = [];
        	  } 
       		  arr.push(history);
        	  LocalContractStorage.set(from, arr);

          return "FAIL payments х" + toPayMultiplicator + " side:" + side;
		}
	},
	data: function () {
   var from = Blockchain.transaction.from;
   var currentTime = new Date();
   var day = currentTime.getDate();
   var plays = this.amount.get(from);
  
        	 if (!plays){
         	   
         	 var plays = new Plays();
              plays.data = day;
		     plays.quantity = new BigNumber(1);
                  
        	} else {
        		
        		
            			  if (day == plays.data) {
 							plays.quantity = new BigNumber(plays.quantity);
 							if (plays.quantity.gte(5)) {
 								 throw new Error("You can play only 5 game per day on easy level");
 						 	}
                         plays.quantity = plays.quantity.plus(1);
 						  
 				 
 					
             		 } else {
                            plays.data = day;
                            plays.quantity = new BigNumber(0);
                             
                       }
               }

        	
        this.amount.put(from, plays);
     return plays.quantity;
    },
   readdata: function () {
     var from = Blockchain.transaction.from;
     var plays = this.amount.get(from);
     if (!plays){
       throw new Error("You dont have any game");
        } 
     return plays;
    },
    read: function () {
     var from = Blockchain.transaction.from;
     var arr = LocalContractStorage.get(from);
     if (!arr || arr.length == 0){
           throw new Error("You dont have any game");
          } 
     return arr;
    },
    
	save: function () {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var deposit = LocalContractStorage.get("vault");

		deposit.balance = value.plus(deposit.balance); 
		LocalContractStorage.set("vault", deposit);
		return deposit.balance;
	},

	takeout: function (value) {
		var from = Blockchain.transaction.from;
		var admin = LocalContractStorage.get("admin");
		if(admin !== from) throw new Error("You are not admin");
		var amount = new BigNumber(value);
        var deposit = LocalContractStorage.get("vault"); 
		if (amount.gt(deposit.balance)) {
			throw new Error("Insufficient balance.");
		}

		var result = Blockchain.transfer(from, amount);
		if (!result) {
			throw new Error("transfer failed.");
		}
		Event.Trigger("BankVault", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: from,
				value: amount.toString()
			}
		});
        deposit.balance =  new BigNumber(deposit.balance);
		deposit.balance = deposit.balance.sub(amount);
		LocalContractStorage.set("vault", deposit);//
		return deposit.balance;
	},
	balanceOf: function () {
		var deposit = LocalContractStorage.get("vault");
		
		return deposit.balance; 
	},
	
};
module.exports = BankVaultContract;
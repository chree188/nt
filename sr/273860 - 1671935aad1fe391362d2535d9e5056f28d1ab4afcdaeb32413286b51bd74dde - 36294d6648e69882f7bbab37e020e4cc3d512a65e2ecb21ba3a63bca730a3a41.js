var History = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.CSC = obj.CSC;
		this.GSC = obj.GSC;
		this.arrG = obj.arrG;
		this.game = obj.game;
		this.arrE = obj.arrE;
		this.arrC = obj.arrC;
		this.res = obj.res;
		this.b = obj.b;
	} else {
	    this.CSC = new BigNumber(0);
	    this.GSC = new BigNumber(0);
	    this.game = "";
	    this.arrE = [];
	    this.arrG = [];
	    this.arrC = [];
	    this.res = "";
	    this.b = new BigNumber(0);


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
	i: function () {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var arr2 = LocalContractStorage.get(from);
         if (!arr2){
           arr2 = [];
          } else {
         var history = arr2[arr2.length -1];
         history.game =  new BigNumber(history.game);
         if (history.game.eq(0)) throw new Error("FG");  
          }
        var value = Blockchain.transaction.value;
		var bet ;
		var remainder = 0;
		if (value.gt(50000000000000000)) { // 0.1 NAS
        bet = new BigNumber(50000000000000000);
         remainder = value.sub(bet);
		} else {
		bet = value;
		}
        var result =Blockchain.transfer(from, remainder);
        if (!result) {
			throw new Error("transfer reainder failed.");
		    }



       var deposit = LocalContractStorage.get("vault");
       deposit.balance =  new BigNumber(deposit.balance);
        if (bet.plus(bet).gt(deposit.balance)) throw new Error("Smart contract doesn't have enough mooney"); 
       deposit.balance = deposit.balance.plus(bet);
		
		 
		var history = new History();
		history.game = 0;
		history.b = bet;
		history.CSC= new BigNumber(0);
		history.GSC= new BigNumber(0);
		var arr = [];
		for(var i=1;i<=52;i++) arr.push(0);
			  
		var nCard=Math.round(Math.random()*51)+1;
		arr[nCard] = 1;
		var arrE = [];
		arrE.push(nCard);
		history.CSC = history.CSC.plus(this.cardValue(nCard));
        nCard=Math.round(Math.random()*51)+1; 
		while(arr[nCard] == 1){
		nCard=Math.round(Math.random()*51)+1; 	
		}
		arr[nCard] = 1;
  		var arrG = [];
  		arrG.push(nCard);
        history.GSC = history.GSC.plus(this.cardValue(nCard));
  		nCard=Math.round(Math.random()*51)+1; 
		while(arr[nCard] == 1){
		nCard=Math.round(Math.random()*51)+1; 	
		}
		arr[nCard] = 1;
  		arrG.push(nCard);
  		history.GSC = history.GSC.plus(this.cardValue(nCard));

  		history.arrG = arrG;
  		history.arrE = arrE;
  		history.arrC = arr;
  		
  		
         arr2.push(history);
         LocalContractStorage.set(from, arr2);
         return LocalContractStorage.get(from);



		//counter = counter.plus(1);
	   // counter = LocalContractStorage.set("counter", counter);
			
	},
	g: function () {
		var from = Blockchain.transaction.from;
		arr=LocalContractStorage.get(from);
		 if (!arr){
           throw new Error("The are not any game");
          } 
         var history = arr[arr.length -1];

         history.game =  new BigNumber(history.game);
         if (history.game.eq(1)) throw new Error("CRTNG");
        nCard=Math.round(Math.random()*51)+1; 
		while(history.arrC[nCard] == 1){
		nCard=Math.round(Math.random()*51)+1; 	
		}
		history.arrC[nCard] = 1;
  		history.arrG.push(nCard);
  	    history.GSC = new BigNumber(history.GSC);
        history.GSC = history.GSC.plus(this.cardValue(nCard));

        if (history.GSC.eq(21)){
        	history.game = 1;
        	while(history.CSC<17)
				{
					 nCard=Math.round(Math.random()*51)+1;
					 while(history.arrC[nCard] == 1){
						nCard=Math.round(Math.random()*51)+1; 	
								}
						 history.arrC[nCard] = 1;
						 history.arrE.push(nCard);
						 history.CSC = new BigNumber(history.CSC);
						history.CSC = history.CSC.plus(this.cardValue(nCard));
  
				}
				if (history.CSC.eq(21)) {
					history.res = "D"
					var deposit = LocalContractStorage.get("vault");
					history.bet = new BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet);
                    var result =Blockchain.transfer(from, history.bet);
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }
				}
				else 
				{
					history.res = "W"
					
					var deposit = LocalContractStorage.get("vault");
					history.bet = new  BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet.plus(history.bet));
                    var result =Blockchain.transfer(from, history.bet.plus(history.bet));
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }
				}

			
			
            
        } else if (history.GSC.gt(21)){
         	history.game = 1;
         	while(history.CSC<17)
				{
					 nCard=Math.round(Math.random()*51)+1;
					 while(history.arrC[nCard] == 1){
						nCard=Math.round(Math.random()*51)+1; 	
								}
						 history.arrC[nCard] = 1;
						 history.arrE.push(nCard);
						 history.CSC = new BigNumber(history.CSC);
						 history.CSC = history.CSC.plus(this.cardValue(nCard));
  
				}
              if (history.CSC.gt(21)) {
              	history.res = "D"
              	var deposit = LocalContractStorage.get("vault");
					history.bet = new  BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet);
                    var result =Blockchain.transfer(from, history.bet);
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }
              } else {
              	history.res = "L"
              }

        }
         LocalContractStorage.set(from, arr);
         return LocalContractStorage.get(from);

		

		},
		dd: function () {
		var from = Blockchain.transaction.from;
		arr=LocalContractStorage.get(from);
		 if (!arr){
           throw new Error("The are not any game");
          } 
         var history = arr[arr.length -1];
    
         history.game =  new BigNumber(history.game);
         if (history.game.eq(1)) throw new Error("CRTNG");
        nCard=Math.round(Math.random()*51)+1; 
		while(history.arrC[nCard] == 1){
		nCard=Math.round(Math.random()*51)+1; 	
		}
		history.arrC[nCard] = 1;
  		history.arrG.push(nCard);
  	    history.GSC = new BigNumber(history.GSC);
  	    history.CSC = new BigNumber(history.CSC);
        history.GSC = history.GSC.plus(this.cardValue(nCard));
        history.game = 1;

         while(history.CSC.lt(17))
				{
					 nCard=Math.round(Math.random()*51)+1;
					 while(history.arrC[nCard] == 1){
						nCard=Math.round(Math.random()*51)+1; 	
								}
						 history.arrC[nCard] = 1;
						 history.arrE.push(nCard);
						 history.CSC = new BigNumber(history.CSC);
						  history.CSC = history.CSC.plus(this.cardValue(nCard));
  
				}

				if (history.CSC.gt(21)){ 
					if (history.GSC.gt(21)){
					history.res = "D";
		 			var deposit = LocalContractStorage.get("vault");
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet);
                    var result =Blockchain.transfer(from, history.bet);
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }

					} else  {
		 			history.res = "W";
		 			var deposit = LocalContractStorage.get("vault");
					history.bet = new  BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet.plus(history.bet));
                    var result =Blockchain.transfer(from, history.bet.plus(history.bet));
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }
		            }
					}

				if (history.CSC.eq == 21){ 
					if (history.GSC == 21){
					history.res = "D";
		 			var deposit = LocalContractStorage.get("vault");
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet);
                    var result =Blockchain.transfer(from, history.bet);
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }

					} else  {
		 			history.res = "L";
		            }
					}
				/*	if (history.CSC.lt(21)){ 
					if (history.GSC.gt(21)){
					history.res = "L";
					} else  {
						if (history.GSC.gt(history.CSC)){
						history.res = "W";
		 			var deposit = LocalContractStorage.get("vault");
					history.bet = new  BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet.plus(history.bet));
                    var result =Blockchain.transfer(from, history.bet.plus(history.bet));
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }	
		        } else if (history.GSC.eq(history.CSC)){
		        	history.res = "D";
		 			var deposit = LocalContractStorage.get("vault");
					history.bet = new BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet);
                    var result =Blockchain.transfer(from, history.bet);
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }

		        } else {

		 			history.res = "L";
		 			var deposit = LocalContractStorage.get("vault");
					history.bet = new  BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet.plus(history.bet));
                    var result =Blockchain.transfer(from, history.bet.plus(history.bet));
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }
		            }
					}
                    }*/
         
         LocalContractStorage.set(from, arr);
         return LocalContractStorage.get(from);

		

		},
	
	cardValue: function (n) {

		if(n<=36)
		   s=parseInt((n-1)/4)+2;
		else if(n<=48)
		   s=10;
		else
		   s=11;

		return s;

		},
		f: function () {

		var from = Blockchain.transaction.from;
		arr=LocalContractStorage.get(from);
		 if (!arr){
           throw new Error("The are not any game");
          } 
         var history = arr[arr.length -1];

         history.game =  new BigNumber(history.game);
         if (history.game.eq(1)) throw new Error("CRTNG");
         history.game = 1;

         while(history.CSC<17)
				{
					 nCard=Math.round(Math.random()*51)+1;
					 while(history.arrC[nCard] == 1){
						nCard=Math.round(Math.random()*51)+1; 	
								}
						 history.arrC[nCard] = 1;
						 history.arrE.push(nCard);
						 history.CSC = new BigNumber(history.CSC);
						  history.CSC = history.CSC.plus(this.cardValue(nCard));
  
				}

		 if (history.CSC.gt(21)){ 
		 	history.res = "W";
		 var deposit = LocalContractStorage.get("vault");
					history.bet = new  BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet.plus(history.bet));
                    var result =Blockchain.transfer(from, history.bet.plus(history.bet));
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }
		}
		 if (history.CSC.eq(21)) history.res = "L";
		 if (history.CSC.gt(history.GSC)) history.res = "L";
		 if (history.CSC.eq(history.GSC)) {
		 	history.res = "D";
		 	var deposit = LocalContractStorage.get("vault");
					history.bet = new BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet);
                    var result =Blockchain.transfer(from, history.bet);
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }
		 }
		 if (history.CSC.lt(history.GSC)) {
		 	history.res = "W";
		 	var deposit = LocalContractStorage.get("vault");
					history.bet = new new BigNumber(history.bet);
                    deposit.balance =  new BigNumber(deposit.balance);
                    deposit.balance = deposit.balance.sub(history.bet.plus(history.bet));
                    var result =Blockchain.transfer(from, history.bet.plus(history.bet));
					LocalContractStorage.set("vault", deposit);
					if (!result) {
					throw new Error("transfer failed.");
		            }
		}

		 LocalContractStorage.set(from, arr);
		 return LocalContractStorage.get(from);



		},


		r: function () {

		var from = Blockchain.transaction.from;
		var from = Blockchain.transaction.from;
		arr=LocalContractStorage.get(from);
		 if (!arr){
           throw new Error("The are not any game");
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
	}

};
module.exports = BankVaultContract;
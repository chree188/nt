var History = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.iCompScore = obj.iCompScore;
		this.iGamerScore = obj.iGamerScore;
		this.arrC = obj.arrC;
		this.arrG = obj.arrG;
		this.game = obj.game;
		this.arrE = obj.arrE;
	} else {
	    this.iCompScore = "";
	    this.iGamerScore = "";
	    this.game = "";
	    this.arrE = [];
	    this.arrC = [];
	    this.arrG = [];


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
		counter = new BigNumber(0);
        LocalContractStorage.put("counter", counter);
        var a = [];
        LocalContractStorage.put("games", a);


 

	
        
	},
	gameInit: function () {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var counter = LocalContractStorage.get("counter"); 
		
		var history = new History();
		history.game = new BigNumber(0);
		history.iCompScore= new BigNumber(0);
		history.iGamerScore= new BigNumber(0);
		var arr = [];
		for(var i=1;i<=52;i++) arr.push(0);
		var nCard=Math.round(Math.random()*51)+1;
		arr[nCard] = 1;
		var arrE = [];
		arrE.push(nCard);
		history.iCompScore = history.iCompScore.plus(this.cardValue(nCard));
        nCard=Math.round(Math.random()*51)+1; 
		while(arr[nCard] == 1){
		nCard=Math.round(Math.random()*51)+1; 	
		}
		arr[nCard] = 1;
  		var arrG = [];
  		arrG.push(nCard);
        history.iGamerScore = history.iGamerScore.plus(this.cardValue(nCard));
  		nCard=Math.round(Math.random()*51)+1; 
		while(arr[nCard] == 1){
		nCard=Math.round(Math.random()*51)+1; 	
		}
		arr[nCard] = 1;
  		arrG.push(nCard);
  		history.iGamerScore = history.iGamerScore.plus(this.cardValue(nCard));
  		history.arrG = arrG;
  		history.arrE = arrE;
  		history.arrC = arr;
  		var arr2 = LocalContractStorage.get(from);
         if (!arr2){
           arr2 = [];
          } 
         arr.push(history);
         LocalContractStorage.set(from, arr2);

         return arr;

		//counter = counter.plus(1);
	   // counter = LocalContractStorage.set("counter", counter);
			
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
	pickCard: function() {

		var nCard;
		while(CardFlag[nCard=Math.round(Math.random()*51)+1]);
		CardFlag[nCard]=1;
		return nCard;

}
};
module.exports = BankVaultContract;
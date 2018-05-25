var DAOContract = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.arr = obj.arr;
		this.minVotes = obj.minVotes;
		this.currenVotes = obj.currenVotes;
		this.balance = obj.balance;
		this.toSent = obj.toSent;
		this.amountToSend = obj.amountToSend;
	} else {
		this.arr = [];
		this.minVotes = new BigNumber(0);
		this.currenVotes = new BigNumber(0);
		this.balance = new BigNumber(0);
		this.toSent = "";
		this.amountToSend = new BigNumber(0);
	}
};
var Voter = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.addr = obj.addr;
		this.bool = obj.bool;
		this.name = obj.name;
	} else {
		this.addr = "";
		this.bool = false;
		this.name = "";
	
	}
};


var DAO = function () {
};

DAO.prototype = {
    init: function (arr) {
 
    },
    isAvailable : function (name) {
    	  if (name === ""){
            throw new Error("empty name");
        }
    	name = name.trim();
            var result = false;
    	  var dao = LocalContractStorage.get(name);
    	   if (!dao){
           return result;
          } 

 if (dao){
            var from = Blockchain.transaction.from;
          member = false;
        for (var i = 0; i < dao.arr.length; i++) {
       	  if (from  == dao.arr[i].addr){
         	 member = true;
      		}		 
		} 	
		if (member){
        
        for (var i = 0; i < dao.arr.length; i++) {
       	  if (from  == dao.arr[i].addr){
         	if (dao.arr[i].bool == true){
         		 result = false;
         	} else {

         		var result = Blockchain.verifyAddress(dao.toSent);
           if (result == 0){
           result = false;
                   } else {

         		result = true;
         	}
         	}
      		}
      	}

		}	
	}
         return result;
    },
    
     cashout: function (name) {
    	  if (name === ""){
            throw new Error("empty name");
        }
    	name = name.trim();

    	  var dao = LocalContractStorage.get(name);

        if (!dao){
           throw new Error("The are no DAO with this name");
          } 
          dao.minVotes = new BigNumber(dao.minVotes);

         if (dao.minVotes.gt(dao.currenVotes))  throw new Error("There is no required number of votes");

        var from = Blockchain.transaction.from;
        member = false;
        for (var i = 0; i < dao.arr.length; i++) {
       	  if (from  == dao.arr[i].addr){
         	 member = true;
      		}		 
		} 	
		if (!member) throw new Error("You can't cashout, you are not member");	

		dao.amountToSend = new BigNumber(dao.amountToSend);

          if (dao.amountToSend.gt(dao.balance)) throw new Error("not enough money"); 

           var result = Blockchain.verifyAddress(dao.toSent);
           if (result == 0){
           throw new Error("Incorrect address");
          } 
          var result = Blockchain.transfer(dao.toSent, dao.amountToSend);
		if (!result) {
			throw new Error("transfer failed.");
		}

		dao.balance = new BigNumber(dao.balance);
		dao.balance = dao.balance.sub(dao.amountToSend);
		dao.toSent = "";
		dao.amountToSend = new BigNumber(0);
		dao.currenVotes = new BigNumber(0);
		for (var i = 0; i < dao.arr.length; i++) {
       	  dao.arr[i].bool = false;     		 
		} 	

       LocalContractStorage.set(name, dao);

         return dao;
    },

    suggest: function (name,addr,amountToSend) {
    	  if (name === ""){
            throw new Error("empty name");
        }
    	name = name.trim();

    	  var dao = LocalContractStorage.get(name);

        if (!dao){
           throw new Error("The are no DAO with this name");
          } 
          var result = Blockchain.verifyAddress(addr);
           if (result == 0){
           throw new Error("Incorrect address");
          } 
          amountToSend = new BigNumber(amountToSend);

          if (amountToSend.gt(dao.balance)) throw new Error("not enough money"); 

        var from = Blockchain.transaction.from;
        member = false;
        for (var i = 0; i < dao.arr.length; i++) {
       	  if (from  == dao.arr[i].addr){
         	 member = true;
      		}		 
		} 	
		if (!member) throw new Error("You can't suggest, you are not member");	

		dao.toSent = addr;
		dao.amountToSend = amountToSend;
		dao.currenVotes = new BigNumber(0);

		 for (var i = 0; i < dao.arr.length; i++) {
       	  dao.arr[i].bool = false;     		 
		} 	
        LocalContractStorage.set(name, dao); 
        return dao;
    },

      deposit: function (name) {
    	  if (name === ""){
            throw new Error("empty name");
        }
    	name = name.trim();

    	  var dao = LocalContractStorage.get(name);

        if (!dao){
           throw new Error("The are no DAO with this name");
          } 

        var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		

		dao.balance = value.plus(dao.balance); 
		LocalContractStorage.set(name, dao);
		
		return dao;
    },
     vote: function (name) {
    	  if (name === ""){
            throw new Error("empty name");
        }
    	name = name.trim();

    	  var dao = LocalContractStorage.get(name);

        if (!dao){
           throw new Error("The are no DAO with this name");
          } 

            var result = Blockchain.verifyAddress(dao.toSent);
           if (result == 0){
           throw new Error("Incorrect address to sent");
          } 
        var from = Blockchain.transaction.from;
        for (var i = 0; i < dao.arr.length; i++) {
       	  if (from  == dao.arr[i].addr){
         	if (dao.arr[i].bool == true){
         		 throw new Error("You are already voted");
         	} else {
         		dao.currenVotes = new BigNumber(dao.currenVotes);
         		dao.currenVotes = dao.currenVotes.plus(1);
         		dao.arr[i].bool = true;
                 LocalContractStorage.set(name,dao);
         		return dao;
         		}
      		}
  			 
		} 		

		
     throw new Error("You are not voter");
    },

     
    create: function (name, minVotes, arr,arrNames) {

        name = name.trim();

         if (name === ""){
            throw new Error("empty name");
        }

        if (minVotes < 1){
            throw new Error("enter the correct data(minVotes)");
        }
        arr = JSON.parse(arr);
        arrNames = JSON.parse(arrNames);
        if (!arr[0]){
            throw new Error("no information about participants DAO");
        }

        for (var i = 0; i < arr.length; i++) {
       	    var result = Blockchain.verifyAddress(arr[i]);
           if (result == 0){
           throw new Error("Incorrect address "+ arr[i]);
          }  		 
		} 	


        var dao = LocalContractStorage.get(name);

        if (dao){
           throw new Error("DAO with this name is exist");
          } 
        for (var i = 0; i < arr.length; i++) {
  			 arr[i].bool = false;
			} 
        var dao = new DAOContract();
        var arr2 = [];    
        for (var i = 0; i < arr.length; i++) {
           	var voter = new Voter();
  			 voter.addr = arr[i];
  			 voter.bool = false;
  			 voter.name = arrNames[i];
  			 arr2.push(voter);
			} 		
        dao.arr = arr2;
        dao.minVotes = minVotes;
        dao.currenVotes = new BigNumber(0);
        dao.balance = new BigNumber(0);
        dao.toSent = "";
        dao.amountToSend = new BigNumber(0);

        LocalContractStorage.set(name, dao);

        return dao;

    },

    read: function (name) {
    	  if (name === ""){
            throw new Error("empty name");
        }
    	name = name.trim();

    	  var dao = LocalContractStorage.get(name);

        if (!dao){
           throw new Error("The are no DAO with this name");
          } 
         return dao;
    }


}
module.exports = DAO;


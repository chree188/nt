'use strict';

var UserScore = function () {
    
	LocalContractStorage.defineMapProperty(this, "arrayMap");
     
	
    LocalContractStorage.defineMapProperty(this, "userMap");
	LocalContractStorage.defineProperty(this, "size");
};

UserScore.prototype = {
	
    init: function () {
		
		this.size = 0;
    },
	
    recordScore: function (score) {
        
		if(!this.userMap.get(Blockchain.transaction.from)  )
		{
			var index = this.size;
			
			this.arrayMap.set(index, Blockchain.transaction.from);
			this.userMap.set(Blockchain.transaction.from,score);
			this.size +=1;
		}
    },
	
    getScore: function () {
        return this.userMap.get(Blockchain.transaction.from);
	},
	
	verifyAddress: function (address) {
		var result = Blockchain.verifyAddress(address);
		return {
		  valid: result == 0 ? false : true
		};
		if(this.userMap.get(address))
		{
			return { valid: false };
		}
	},
	
	getAllScore: function(){
        
		var number = this.size;
		
        var result  = "";
        for(var i=0;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.userMap.get(key);
			
			result += 'Address:'+ key + ',score:' + object+'|';
        }
		 
        return result;
    }
	
	 
};

module.exports = UserScore;
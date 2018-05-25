'use strict';
var SampleContract = function () {
   LocalContractStorage.set("admin","n1LihoAbPc6xvxZq1pHupw3ASnWMaJgm6cG");
};

SampleContract.prototype = {
    init: function () {
    },
   clipIn: function(number) {
         var from = Blockchain.transaction.from;
         var value = Blockchain.transaction.value;
         var resultNumber = parseInt(Math.floor(Math.random()*10+1));
         if (number == resultNumber &&  value == 1) {
               Blockchain.transfer(from, 10);
                Event.Trigger("searchResult", {
			Result: {
				from: Blockchain.transaction.to,
				to: from,
				value: value
			}
		});
               return  true; 
        } else {
                Event.Trigger("searchResult", {
			Result: {
				from: Blockchain.transaction.to,
				to: from,
				value: resultNumber
			}
		});
               return resultNumber;
        } 
       
    },
withDraw: function(value) {
   var admin = LocalContractStorage.get("admin");
     if( Blockchain.transaction.from == admin){
     Blockchain.transfer(admin, value);
     return true;
    }else{
     return false;
}
}
};

module.exports = SampleContract;
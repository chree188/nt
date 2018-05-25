'use strict';
var SampleContract = function () {
};
SampleContract.prototype = {
    init: function () {
    },
   clipIn: function(number) {
         number =  parseInt(number);
         var from = Blockchain.transaction.from;
         var value = Blockchain.transaction.value;
return  value;
         var resultNumber = parseInt(Math.floor(Math.random()*10+1)); 
          if (number == resultNumber &&  value == 1) {
            var result =  Blockchain.transfer(from, 10);
               return  true; 
              console.log("你猜对了，获得10个NAS奖励");
              } else {
               return resultNumber;
              console.log("你猜错了，正确答案是"+resultNumber);
        } 
    },
withDraw: function(amount) {
     amount = parseInt(amount);
     var user =  Blockchain.transaction.from;
     if( user == "n1LihoAbPc6xvxZq1pHupw3ASnWMaJgm6cG"){
       var withDrawResult = Blockchain.transfer(user, amount);
     if (withDrawResult == true) {
            return true;
            console.log("提款成功");
      }  else {
            return false;
            console.log("提款失败");
        }
    }else{
     return ;
     console.log("你没有权限");
}
}
};

module.exports = SampleContract;
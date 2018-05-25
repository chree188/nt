"use strict";
var Statics = function(data){
	if (data) {
		var obj = JSON.parse(data);
		this.roundNo = obj.roundNo;
		this.totalAmt = obj.totalAmt;
		this.numberOfPlayerThisRound = obj.numberOfPlayerThisRound;
		this.winNumber = obj.winNumber;
		this.lastWinNumber = obj.lastWinNumber;
	}
};
Statics.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};
var Lucky100Contract = function () {
   //config
   LocalContractStorage.defineProperty(this, "owner");
   LocalContractStorage.defineProperty(this, "minimumPlayAmt");
   LocalContractStorage.defineProperty(this, "maxPlayCountPerRound");

   //Info
   LocalContractStorage.defineProperty(this, "roundNo");
   LocalContractStorage.defineProperty(this, "totalAmt");
   LocalContractStorage.defineProperty(this, "numberOfPlayerThisRound");
   LocalContractStorage.defineProperty(this, "winNumber");
   LocalContractStorage.defineProperty(this, "lastWinNumber");
	 LocalContractStorage.defineMapProperty(this, "numberPlayersMap",{
	   stringify: function (o) {
            return o.toString();
       },
	   parse: function (str) {
            return str;
       }
   });
   LocalContractStorage.defineMapProperty(this, "playerNumberMap",{
	   stringify: function (o) {
            return o.toString();
       },
	   parse: function (str) {
            return new BigNumber(str);
       }
   });

   LocalContractStorage.defineMapProperty(this, "statics", {
        parse: function (data) {
            return new Statics(data);
        },
        stringify: function (o) {
            return o.toString();
        }
	});
};

Lucky100Contract.prototype = {
    init: function () {
      this.owner='n1YtfpTbR6YSzdsqeiqDQv63kxm7pmyGf6e';
      this.minimumPlayAmt=0.01;
      this.maxPlayCountPerRound=10;
      //
	  	this.roundNo=1;
      this.totalAmt=new BigNumber(0);
      this.numberOfPlayerThisRound=0;
      this.winNumber=0;
	  	this.lastWinNumber=0;
    },
    withdraw: function(address, value) {
        var fromUser = Blockchain.transaction.from

        if (fromUser == this.owner && Blockchain.verifyAddress(address)) {
            var amount = new BigNumber(value * 1000000000000000000)
            var result = Blockchain.transfer(address, amount);
            return result
        }
        throw new Error("-100");
    },
    hasPlayedThisRound: function(playerAddr){
       if(this.playerNumberMap.get(playerAddr))
          return true;
       else
          return false;
    },
    play:function(num){
       if(this.numberOfPlayerThisRound > this.maxPlayCountPerRound){
         throw new Error("100");
       }
       var fromUser = Blockchain.transaction.from;
       if(this.hasPlayedThisRound(fromUser) == true){
         throw new Error("101");
       }

       if(num < 1 || num > 6){
         throw new Error("102");
       }
       var _amt = new BigNumber(Blockchain.transaction.value / 1000000000000000000);
       if( _amt.lessThan(new BigNumber(this.minimumPlayAmt))){
         throw new Error("103");
       }

       var addrs=this.numberPlayersMap.get(num);
       if(addrs){
				 addrs+=","+fromUser;
       }else{
				 addrs=fromUser;
	   	 }
       this.numberPlayersMap.set(num,addrs);
			 this.playerNumberMap.put(fromUser,num);
       this.numberOfPlayerThisRound += 1;
       this.totalAmt = this.totalAmt+new BigNumber(Blockchain.transaction.value / 1000000000000000000);

       if(this.numberOfPlayerThisRound >= this.maxPlayCountPerRound){
         this.generatewinNumber();
       }
    },
    generatewinNumber:function(){
       if(this.numberOfPlayerThisRound>=this.maxPlayCountPerRound){
         var _hash= Blockchain.transaction.hash;
         var _number=_hash.charCodeAt(Blockchain.transaction.nonce%_hash.length);
         this.winNumber=_number% 6 + 1
         this.distributePrizes();
       }
    },
    distributePrizes:function(){
			if(this.winNumber>0&&this.winNumber<7){
      	var _winnersSTR=this.numberPlayersMap.get(this.winNumber);

        if(_winnersSTR){
		  		var _winners=_winnersSTR.split(",");
          var _count=_winners.length;
		  		if(_count>0){
			  		var _distAmt=new BigNumber((this.totalAmt*0.9) / _count);

			  		for(var i=0;i<_count;i++){
							var result = Blockchain.transfer(_winners[i], _distAmt*1000000000000000000);
			  		}
						this.reset();
		  		}else{
						this.reset();
					}

        }else{
					this.reset();
				}

      }
    },
		resetRules:function(amt,num){
			this.minimumPlayAmt=amt;
      this.maxPlayCountPerRound=num;
		},
		manualDistributePrizes:function(){
	  	var fromUser = Blockchain.transaction.from;
      if(this.owner==fromUser){
				this.winNumber=Math.random.seed(100)% 6 + 1
        var _winners=this.numberPlayersMap.get(this.winNumber);
        if(_winners){
          var _count=_winners.length;
		  		if(_count>0){
			  		var _distAmt=new BigNumber((this.totalAmt*0.9) / _count);

			  		for(var i=0;i<_count;i++){
							var result = Blockchain.transfer(_winners[i], _distAmt*1000000000000000000);
			  		}
		  		}
        }
        this.reset();
      }
    },
    reset: function(){
	  	var _static = this.statics.get(this.roundNo);
	  	if(!_static){
				_static = new Statics();
	  	}else{
		  	this.statics.del(this.roundNo);
	  	}
	  	_static.roundNo = this.roundNo;
	  	_static.winNumber = this.winNumber;
	  	_static.lastWinNumber = this.lastWinNumber;
	  	_static.totalAmt=this.totalAmt;
	  	_static.numberOfPlayerThisRound=this.numberOfPlayerThisRound;
	  	this.statics.put(this.roundNo, _static);

      this.totalAmt=new BigNumber(0);
	  	this.lastWinNumber=this.winNumber;
	  	this.roundNo=this.roundNo+1;
      this.winNumber=0;
      this.numberOfPlayerThisRound=0;
			for(var i=1;i<=6;i++){
				var _playersSTR=this.numberPlayersMap.get(i);
				if(_playersSTR){
					var _players = _playersSTR.split(",");
					for(var j=0;j<_players.length;j++){
						if(this.playerNumberMap.get(_players[j])){
							this.playerNumberMap.del(_players[j]);
						}
					}
					this.numberPlayersMap.del(i);
				}
			}
    },
		set: function(num, address){
			var addrs=this.numberPlayersMap.get(num);
			if(addrs){
				addrs+=","+address;
			}else{
				addrs=address;
			}
			this.numberPlayersMap.set(num,addrs);
		},
    get: function (code,param) {
			if(code==1){
		  	return JSON.stringify({minimumPlayAmt:this.minimumPlayAmt,maxPlayCountPerRound:this.maxPlayCountPerRound,totalAmt:this.totalAmt,numberOfPlayerThisRound:this.numberOfPlayerThisRound,lastWinNumber:this.lastWinNumber});
			}else if(code==2){
      	return JSON.stringify(this.numberPlayersMap.get(param));
      }else if(code==3){
        return JSON.stringify(this.playerNumberMap.get(param));
      }else if(code==4){
        return JSON.stringify(this.statics.get(param));
      }
    }
};
module.exports = Lucky100Contract;
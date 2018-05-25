"ranking list";

var RankingContract = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineProperty(this, "size");
};

RankingContract.prototype = {
    init: function () {
        this.size = 0;
    },

	set: function (key, value) {
        var index = this.size;
		var from = Blockchain.transaction.from;
		if(!from){
			throw new Error("offset is not valid");
        }
		if(this.get(key+"_"+from)) {
			this.dataMap.set(key+"_"+from, value);
		}
		else{
			this.arrayMap.set(index, key+"_"+from);
			this.dataMap.set(key+"_"+from, value);
			this.size +=1;
		}
    },

    get: function (key) {
        return this.dataMap.get(key);
    },

    len:function(){
      return this.size;
    },

    getRinkingList: function(isMe,limit){
        limit = parseInt(limit);

        var offset = 0;
		var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
		var from = Blockchain.transaction.from;
		if(parseInt(isMe)>0){
			for(var l=0;l<this.size;l++){
				if(this.arrayMap.get(l).indexOf(from)>0) break;
				offset ++;
			}
			if(offset>0) offset = offset -1 ;
		}


        var result  = [];
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            var temp={
                index:i,
                key:key,
				isMe:(key.indexOf(from)>0)?1:0,
                value:object
            }
			
            result.push(temp);
        }
        return JSON.stringify(result);
    }
};

module.exports = RankingContract;
"use strict";

var CoinItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.voter = obj.voter;
		this.poll = new BigNumber(obj.poll);
	} else {
	    this.key = "";
	    this.voter = "";
	    this.value = "";
			this.poll = 0;
	}
};



CoinItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var HotDollar = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new CoinItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

	LocalContractStorage.defineMapProperty(this, "arrayMap");

	LocalContractStorage.defineProperty(this, "size");
	LocalContractStorage.defineMapProperty(this, "voters");

	LocalContractStorage.defineProperty(this, "height");
};

HotDollar.prototype = {
    init: function () {
        // todo

				this.size = 0;
        this.height = 100;  // time to wait for next vote
				var key = "NAS"
				CoinItem = new CoinItem();
				CoinItem.voter = Blockchain.transaction.from;
				CoinItem.key = key;
				CoinItem.value = "Nebulas";
				CoinItem.poll = 0;

				this.repo.put(key, CoinItem);
				this.arrayMap.put(0, key);
				this.size +=1;
    },

    // get: function (key) {
    //     return this.repo.get(key);
    // },

    len:function(){
      return this.size;
    },


		getAll: function(){

				var tokens = [];
				for(var i=0;i<this.size;i++){

           var key = this.arrayMap.get(i);

					 tokens.push(this.repo.get(key));
				}

				return tokens;
		},

    save: function (key,value) {

			key = key.trim();
			value = value.trim();
			if (key === "" || value === ""){
					throw new Error("empty key / value");
			}
			if (value.length > 64 || key.length > 64){
					throw new Error("key / value exceed limit length")
			}

			var from = Blockchain.transaction.from;
			// var CoinItem = this.repo.get(key);
			// if (CoinItem){
			// 		throw new Error("value has been occupied");
			// }
			//

  			var index = this.size;

				CoinItem = new CoinItem();
				CoinItem.voter = Blockchain.transaction.from;;
				CoinItem.key = key;
				CoinItem.value = value;
				CoinItem.poll = 0;

				this.repo.put(key, CoinItem);
				this.arrayMap.put(index, key);

				this.size +=1;


    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },

		vote: function (key) {
				key = key.trim();
				if ( key === "" ) {
						throw new Error("empty key")
				}


       if(this.voters.get(Blockchain.transaction.from)){
				if (bk_height.lt(new BigNumber(this.voters.get(Blockchain.transaction.from)))) {
			    throw new Error("Can not vote before expiryHeight.");
		    }
       }

				CoinItem = this.repo.get(key);

				CoinItem.poll++;

				this.repo.put(key, CoinItem);

        // mark the voters
				var bk_height = new BigNumber(Blockchain.block.height);
        var expiryHeight = bk_height.plus(this.height);

				this.voters.put(Blockchain.transaction.from,expiryHeight);
		}

};
module.exports = HotDollar;

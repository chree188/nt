"use strict";


var WishItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.wishfrom = obj.author;
		this.nickname = obj.nickname;
		this.wishcontent=obj.wishcontent;
		this.addtime=obj.addtime;
	} else {
	    this.key = "";
	    this.wishfrom = "";
	    this.nickname = "";
		this.wishcontent="";
		this.addtime="";
		
	}
};

WishItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var WishwallContract = function () {
   LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new WishItem(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
   LocalContractStorage.defineProperty(this, "size");
   

   
};

WishwallContract.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (nickname,wishcontent) {
        var index = this.size;
		var from = Blockchain.transaction.from;
		
		var wishItem = new WishItem();
		wishItem.key=index;
        wishItem.wishfrom = from;
        wishItem.nickname = nickname;
        wishItem.wishcontent = wishcontent;
		wishItem.addtime=Blockchain.block.timestamp;
        this.dataMap.set(index, wishItem);
        this.size +=1;
    },

    get: function (key) {
        return this.dataMap.get(key);
    },

    len:function(){
      return this.size;
    },
    listdesc: function(limit){
		if(this.size==0){ return "";}
        limit = parseInt(limit);
		var number=limit;
        if(limit>this.size){
           number = this.size;
        }
		
		
        var result  = "";
		var wish=new Array();
        for(var i=this.size-1;i>=0;i--){
			if(limit<=0){break;}
            var object = this.dataMap.get(i);
            wish.push(object);
			limit--;
        }
		result=JSON.stringify(wish);
        return result;
    },
    listoffset: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = "";
		var wish=new Array();
        for(var i=offset;i<number;i++){
            var object = this.dataMap.get(i);
            wish.push(object);
        }
		result=JSON.stringify(wish);
        return result;
    }
};

module.exports = WishwallContract;
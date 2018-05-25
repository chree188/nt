"use strict";

var Wish = function(str) {
	if (str) {
		var obj = JSON.parse(str);
        this.text = obj.text;
        this.desc=obj.desc;
        this.pic = obj.pic;
        this.target=obj.target;
		this.creator = obj.creator;
	} else {
        this.text = "";
        this.desc="";
        this.pic = "";
        this.target=0;
	    this.creator = "";
	}
};

Wish.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var WishDeposit=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        wishIndex: null
    });
    LocalContractStorage.defineMapProperties(this,{ 
        indexToTakeout:null,
        indexToDepositTime:null,
        indexToCurrent:null
    });
    LocalContractStorage.defineMapProperty(this, "indexToWish", {
        parse: function (text) {
            return new Wish(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

WishDeposit.prototype={
    init:function(builder){
        this.builder=builder;
        this.wishIndex=0;
    },
    _isBuilder:function(addr){
         if(addr!==this.builder){
             throw new Error("you have no permission")
         }
    },
    _sort:function(arr){
        arr.sort(function(a,b){
            return b.deposTime-a.deposTime;
        	}
        );
        return arr;
    },

    _getRand:function(min,max){
        return parseInt(Math.random()*(max-min+1)+min,10);
    },
    getWishByID:function(id){
        return this.indexToWish.get(id);
    },
    _getWish:function(id){
        var wish={}
        var w=this.indexToWish.get(id);
        wish.id=id;
        wish.text = w.text;
        wish.desc=w.desc;
        wish.target=w.target;
        wish.takeout=this.indexToTakeout.get(id);
        wish.current=this.indexToCurrent.get(id);
        wish.deposTime=this.indexToDepositTime.get(id);
        wish.pic=w.pic;
        wish.creator=w.creator;
        return wish;
    },
    getMyWishes:function(){
        var from=Blockchain.transaction.from;
        var wishes=[];
        for (var i = 1; i <= this.wishIndex; i++) {
            var wish=this._getWish(i);
            if(wish.creator===from) wishes.push(wish);
        }
        return wishes;
    },
    getAllWishes:function(){
        var wishes=[];
        for (var i = 1; i <= this.wishIndex; i++) {
            var wish=this._getWish(i);
            wishes.push(wish);
        }
        //sort
        wishes= this._sort(wishes)
        return wishes;
    },
    
    getBaseData:function(){
        var from=Blockchain.transaction.from;
        var result={};
        result['wishes']=this.getAllWishes();
        result['account']=from;
        return result;
    },
    

    depositWish:function(id){
        var from=Blockchain.transaction.from;
        var value=Blockchain.transaction.value;
        var now = Blockchain.transaction.timestamp;
        var wish=this.indexToWish.get(id);
        var current=this.indexToCurrent.get(id);
        if(!current) current=0;
        current=new BigNumber(current)
        if (current.greaterThanOrEqualTo(wish.target)) {
            throw new Error('this wish has been completed');
        }
        current=current.plus(value);
        this.indexToCurrent.set(id,current);
        this.indexToDepositTime.set(id,now)
    },

       
    createWish:function(text,desc,target,pic){
        text=text.trim();
        pic=pic.trim();
        if (pic===""||text===""||target===""){
            throw new Error("empty text/target/pic url");
        } 
        if (text.length > 200 ){
            throw new Error("text exceed limit length")
        }
        target=new BigNumber(target).shift(18);
        if(!target.greaterThan(0)){
            throw new Error("nas target error");
        }
       
        var from=Blockchain.transaction.from;
        this.wishIndex++;
        var wish=new Wish();
        wish.text=text;
        wish.desc=desc;
        wish.pic=pic;
        wish.target=target;
        wish.creator=from;

        this.indexToWish.set(this.wishIndex,wish);
        
    },
    takeoutWish:function(id){
        var from=Blockchain.transaction.from;
        var wish=this.indexToWish.get(id);
        if(wish.creator!==from){
            throw new Error("you have no permission");
        }
        if(this.indexToTakeout.get(id)){
            throw new Error('this wish has been taken out!');
        }
        var current=new BigNumber(this.indexToCurrent.get(id));
        if (current.lessThan(wish.target)) {
            throw new Error('this wish has not been finished yet');
        }
        this.indexToTakeout.set(id,true);
        Blockchain.transfer(from,current)
    }
}

module.exports = WishDeposit;


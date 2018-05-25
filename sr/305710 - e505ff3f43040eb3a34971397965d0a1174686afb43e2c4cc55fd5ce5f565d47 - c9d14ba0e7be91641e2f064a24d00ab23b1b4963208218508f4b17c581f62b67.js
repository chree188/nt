"use strict";

var Gift = function(str) {
	if (str) {
        var obj = JSON.parse(str);
        this.data=obj.data;
        this.value=obj.value;
        this.time=obj.time;
        this.desc=obj.desc;
        this.eval=obj.eval;
        this.owner=obj.owner;
		this.creator = obj.creator;
	} else {
	    this.data="";
        this.value="";
        this.time="";
        this.desc="";
        this.eval="";
        this.owner="";
		this.creator = "";
	}
};

Gift.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var MysteryGift=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        giftIndex: null
    });
    LocalContractStorage.defineMapProperties(this,{
        addrSerToKey:null,  //addr serial temp key
        addrIdToKey:null,  //creator addr id 
        addrToValueCount: null,
        addrToSupValueCount:null,
        addrToUnValueCount:null,
        addrToReportCount:null
    });
    LocalContractStorage.defineMapProperty(this, "indexToGift",{
        parse: function (text) {
            return new Gift(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
 
}

MysteryGift.prototype = {
    init:function(builder){
        this.builder=builder;
        this.giftIndex=0;
    },
    _verAddress:function(addr){
        if (!Blockchain.verifyAddress(addr)) {
            throw new Error("account address error")
        }
    },
    _isBuilder:function(addr){
       // this._verAddress(addr);
        if(addr!==this.builder){
            throw new Error("you have no permission")
        }
    },
    _getRand:function(min,max){
        return Math.floor(Math.random()*(max-min+1)+min,10);
    },
    
    _getGift:function(id){
        var g=this.indexToGift.get(id);
        var gift={}
        gift.id=id;
        gift.value=new BigNumber(g.value).shift(-18);
        gift.desc=g.desc;
        gift.eval=g.eval;
        gift.time=g.time;
        gift.owner=g.owner;
        gift.creator=g.creator;
       
        return gift;
    },
    _getRandCode:function(len){
        var d,e,b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",c = "";
        for (d = 0;d<len; d ++) {
            e = Math.random() * b.length, e = Math.floor(e), c += b.charAt(e);
        }
        return c;  
    },

    getAllGifts:function(){
        var from=Blockchain.transaction.from;
        var arr=[];
        for (var i = 1; i <= this.giftIndex; i++) {
            var g=this._getGift(i);
            if(g.owner===""){
                var ct={}
                ct.from=g.creator;
                ct.vc=this.addrToValueCount.get(g.creator)
                ct.svc=this.addrToSupValueCount.get(g.creator)
                ct.unvc=this.addrToUnValueCount.get(g.creator)                
                ct.rpc=this.addrToReportCount.get(g.creator)                
                g.creator=ct;
                arr.push(g);
            }
        }
        return arr;
    },
    getMyGifts:function(){
        var from=Blockchain.transaction.from;
        var arr=[];
        //you create or you open
        for (var i = 1; i <= this.giftIndex; i++) {
            var g=this._getGift(i);
            if(g.owner===from||g.creator===from){
                arr.push(g)
            }
        }
        return arr;
    },
    getBaseData:function(){
        var from=Blockchain.transaction.from;
        var result={};
        result['gifts']=this.getAllGifts();
        result['account']=from;
        return result;
    },
    createTempKey:function(serial){
        var from=Blockchain.transaction.from;
        var code=this._getRandCode(32);
        this.addrSerToKey.set(from+'_'+serial,code);
    },
    getTempKey:function(serial){
        var from=Blockchain.transaction.from;
        return this.addrSerToKey.get(from+'_'+serial)
    },

    createGift:function(serial,data,value){
        var from=Blockchain.transaction.from;
        if(this.addrToReportCount.get(from)>1){
            throw new Error("You have been reported!");
        }
        if (serial===""|| data==="") {
            throw new Error("input error!");
        }
        var time=Blockchain.transaction.timestamp;
        value=new BigNumber(value).shift(18);
        
        this.giftIndex++;
        
        var gift=new Gift();
        gift.value=value;
        gift.data=data;
        gift.time=time;
        gift.creator=from;

        var key=this.addrSerToKey.get(from+'_'+serial);
        if(!key) throw new Error("key null");
        this.addrIdToKey.set(from+'_'+this.giftIndex,key);
        this.indexToGift.set(this.giftIndex,gift);
    },
    buyGift:function(id){
        var from=Blockchain.transaction.from;
        var value=Blockchain.transaction.value;
        var gift=this.indexToGift.get(id);
        if(!value.equals(gift.value)){
            throw new Error("you must give enough NAS")
        } 
        if(gift.owner!==""){
            throw new Error("This gift  has been bought")
        }

        gift.owner=from;
        this.indexToGift.set(id,gift);

        var key=this.addrIdToKey.get(gift.creator+'_'+id);
        this.addrIdToKey.set(from+'_'+id,key);
        //tranfer
        Blockchain.transfer(gift.creator,value);
    },
    openGift:function(id){
        var from=Blockchain.transaction.from;
        var value=Blockchain.transaction.value;
        var gift=this.indexToGift.get(id);
       
        if(gift.creator!==from&&gift.owner!==from){
            return {"error":'Gift is not yours,you have no permission'};
        }
        
        var result={
            "id":id,
            "key":this.addrIdToKey.get(from+'_'+id),
            "data":gift.data
        };
        return result;
    },

    evalGift:function(id,evaluated){
        var from=Blockchain.transaction.from;
        var gift=this.indexToGift.get(id);
        
        if(isNaN(evaluated)||gift.creator===from){
            throw new Error("evaluation error");
        }
        if(gift.owner!==from) {
            throw new Error("Gift is not yours");
        }
        if(gift.eval!==""){
            throw new Error("You are already evaluated it");
        }
        gift.eval=evaluated;
        this.indexToGift.set(id,gift);
        switch (evaluated) {
            case 0:
                var rpc=this.addrToReportCount.get(gift.creator);
                rpc++;
                this.addrToReportCount.set(gift.creator,rpc);
                break;
            case 1:
                var vc=this.addrToValueCount.get(gift.creator);
                vc++;
                this.addrToValueCount.set(gift.creator,vc);
                break;
            case 2:
                var svc=this.addrToSupValueCount.get(gift.creator);
                svc++;
                this.addrToSupValueCount.set(gift.creator,svc);
                break;
            case 3:
                var unvc=this.addrToUnValueCount.get(gift.creator);
                unvc++;
                this.addrToUnValueCount.set(gift.creator,unvc);
            default:
                break;
        }
    },
    takeout:function(value){
        var from=Blockchain.transaction.from;
        this._isBuilder(from)
        value=new BigNumber(value).times("1000000000000000000");
        
        Blockchain.transfer(this.builder,value)
    }

}
module.exports = MysteryGift;
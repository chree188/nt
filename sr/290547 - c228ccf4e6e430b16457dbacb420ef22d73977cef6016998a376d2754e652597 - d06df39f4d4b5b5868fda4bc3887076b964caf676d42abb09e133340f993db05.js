"use strict";

var Box = function(str) {
	if (str) {
		var obj = JSON.parse(str);
        this.cost=obj.cost;
        this.award=obj.award;
        this.birth=obj.birth;
        this.opener=obj.opener;
		this.creator = obj.creator;
	} else {
	    this.cost   = "";
        this.award  = "";
        this.opener ="";
        this.birth="";
		this.creator= "";
	}
};

Box.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Record=function(str){
    if (str) {
		var obj = JSON.parse(str);
        this.cost=obj.cost;
        this.time=obj.time;
        this.opened=obj.opened;
		this.from = obj.from;
	} else {
	    this.cost="";
        this.time="";
        this.opened=false;
		this.from = "";
	}
};

Record.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var TTBox=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        boxIndex: null
    });
    LocalContractStorage.defineMapProperties(this,{
        indexToKeyStr: null,  // index to keyarray
        bidToRecordIds:null,
        addressToBoxIds: null  //you create or you open
    });
    LocalContractStorage.defineMapProperties(this, {
        indexToBox:{
            parse: function (text) {
                return new Box(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        ridToRecord:{
            parse: function (text) {
                return new Record(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
        
    });
}

TTBox.prototype = {
    init:function(){
        this.builder=Blockchain.transaction.from;
        this.boxIndex=0;
        // this.mineGas ="100000000000000" //0.0001
        // this.award   ="1000000000000000000";

        //this._createBlock("0000",this.builder)
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
    _getNow:function(){
        return Math.floor(Date.parse( new Date())/1000);
    },
    
    createGenesis:function(){
        var from=Blockchain.transaction.from;
        this._isBuilder(from);

    },
    _getBox:function(id){
        var b=this.indexToBox.get(id);
        var box={}
        box.id=id;
        box.opener=b.opener;
        box.cost=b.cost;
        box.award=b.award;
        box.now=this._getNow();
        box.birth=b.birth;
        box.creator=b.creator;
        return box;
    },
    _getRandKeyStr:function(){
        var str="";
        for (var i = 0; i < 10; i++) {
            var r=this._getRand(0,9);
            str+=r;
        }
        return str;
    },
    _getBoxKey:function(id){
        var now=this._getNow();
        var box=this.indexToBox.get(id);
        // var diffmin=Math.floor((now-box.birth)/(60*10));
        var diffmin=Math.floor((now-box.birth)/(30));
        if(diffmin>=10){
            diffmin+="";
            diffmin=parseInt(diffmin.substr(diffmin.length-1,1));
        }
        var keyStr=this.indexToKeyStr.get(id);
        return keyStr.charAt(diffmin);
    },
    test:function(id){
        var result={};
        result.nowKey=this._getBoxKey(id);
        result.keystr= this.indexToKeyStr.get(id);
        return result;
    },

    getAllBoxes:function(){
        var arr=[];
        for (var i = 1; i <= this.boxIndex; i++) {
            var b=this._getBox(i);
            if(b.opener===""){
                arr.push(b);
            }
        }
        return arr;
    },
    getMyBoxes:function(){
        var from=Blockchain.transaction.from;
        var arr=[];
        //you create or you open
        var bids=this.addressToBoxIds.get(from);
        bids.forEach(i => {
            var b=this._getBox(i);
            arr.push(b);
        });
        return arr;
    },
    getBaseData:function(){
        var from=Blockchain.transaction.from;
        var result={};
        result['boxes']=this.getAllBoxes();
        result['account']=from;
        return result;
    },

    createBox:function(){
        var from=Blockchain.transaction.from;
        var time=Blockchain.transaction.timestamp;
        var value=Blockchain.transaction.value;
        // if(value.equals(0)){
        //     throw new Error("you must give some NAS as award ")
        // }
        this.boxIndex++;
        var box=new Box();
        box.cost=value.shift(-1);
        box.award=value;
        box.birth=time;
        box.creator=from;

        var keyStr=this._getRandKeyStr();
        this.indexToKeyStr.set(this.boxIndex,keyStr);
        this.indexToBox.set(this.boxIndex,box);

        var boxes=this.addressToBoxIds.get(from);
        if(!boxes) boxes=[];
        boxes.push(this.boxIndex);
        this.addressToBoxIds.set(from,boxes);
    },

    openBox:function(id,key,rid){
        var from=Blockchain.transaction.from;
        var value=Blockchain.transaction.value;
        var time=Blockchain.transaction.timestamp;
        var box=this.indexToBox.get(id);
        if(!value.equals(box.cost)){
            throw new Error("you must give enough NAS ")
        }
        if(box.opener!==""){
            throw new Error("This box  has been opened")
        }
        
        var tkey=this._getBoxKey(id);
        
        if(key===tkey){
            box.opener=from;
            this.indexToBox.set(id,box)
            var bids=this.addressToBoxIds.get(from);
            if(!bids) bids=[];
            bids.push(id);
            this.addressToBoxIds.set(from,bids);
            //award tranfer
            Blockchain.transfer(from,box.award);
        }

        var record=new Record();
        record.cost=value;
        record.time=time;
        record.opened=key===tkey;
        record.from=from;

        var rids=this.bidToRecordIds.get(id);
        if(!rids) rids=[];
        rids.push(rid);
        this.bidToRecordIds.set(id,rids);
        this.ridToRecord.set(rid,record);

        //cost tranfer
        Blockchain.transfer(box.creator,value);

    },
    openBoxResult:function(rid){
        return this.ridToRecord.get(rid);
    },
    getBoxRecord:function(bid){
        var from=Blockchain.transaction.from;
        var rids= this.bidToRecordIds.get(bid);
        var result={};
        var arr=[];
        rids.forEach(r => {
            var rec=this.ridToRecord.get(r)
            arr.push(rec);
        });
        return arr;
    },
    takeout:function(value){
        var from=Blockchain.transaction.from;
        this._isBuilder(from)
        value=new BigNumber(value).times("1000000000000000000");
        if (value.greaterThan(this.bal)){ 
            throw new Error('insufficient balance')
        }
        if(Blockchain.transfer(this.builder,value)){ 
            var bal=new BigNumber(this.bal);
           this.bal=bal.minus(value);
       }
    }

}
module.exports = TTBox;
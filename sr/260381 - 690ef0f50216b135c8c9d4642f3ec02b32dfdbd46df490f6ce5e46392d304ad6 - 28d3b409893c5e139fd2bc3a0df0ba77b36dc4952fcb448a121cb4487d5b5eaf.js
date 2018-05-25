"use strict";

var Barrage = function(str) {
	if (str) {
		var obj = JSON.parse(str);
		this.text = obj.text;
        this.time = obj.time;
        this.from=obj.from;
	} else {
	    this.text = "";
        this.time = "";
        this.from = "";
	}
};

Barrage.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SkyBarrage=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        barrageIndex: null
    });
    // LocalContractStorage.defineMapProperties(this,{
    //     indexToKey: null,  //
    //     addressToResult: null, //
    //     
    // });
    LocalContractStorage.defineMapProperty(this, "indexToBarrage", {
        parse: function (text) {
            return new Barrage(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

SkyBarrage.prototype={
    init:function(){
        this.builder=Blockchain.transaction.from;
        this.barrageIndex=0;
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
    getBarrageByID:function(id){
        return this.indexToBarrage.get(id)
    },
    getBaseData:function(){
        var from=Blockchain.transaction.from; 
        var result={};       
        var arr=[];
        for (var i = 1; i <= this.barrageIndex; i++) {
            var bar=this.indexToBarrage.get(i);
            arr.push(bar);
        }
        result['barrages']=arr;
        result['account']=from;
        return result;
    },
    postBarrage:function(text){
        text=text.trim();
        if (text.length > 50 ){
            throw new Error("barrage exceed limit length (50)")
        }
        var from=Blockchain.transaction.from;
      
        var time=Blockchain.transaction.timestamp;
        this.barrageIndex++;
        var barrage=new Barrage();
        barrage.text=text;
        barrage.time=time;
        barrage.from=from;
        this.indexToBarrage.set(this.barrageIndex,barrage);
    }

}

module.exports = SkyBarrage;
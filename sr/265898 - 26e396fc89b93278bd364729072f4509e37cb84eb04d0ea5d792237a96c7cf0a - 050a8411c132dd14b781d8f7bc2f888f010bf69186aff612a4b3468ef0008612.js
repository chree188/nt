"use strict";

var Balloon = function(str) {
	if (str) {
		var obj = JSON.parse(str);
        this.text = obj.text;
        this.toName=obj.toName;
        this.toAddr=obj.toAddr;
        this.fromName = obj.fromName;
        this.fromAddr = obj.fromAddr;
        this.time = obj.time;
	} else {
        this.text = "";
        this.toName="";
	    this.toAddr = "";
	    this.fromName = "";
        this.fromAddr = "";
        this.time ="";
	}
};

Balloon.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var ConfessBalloon=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        balloonIndex: null,
        defaultHeight:null
    });
    LocalContractStorage.defineMapProperties(this,{ 
        addressToIndex:null,  // to ballon index
        indexToPumpTime:null,
        indexToFlyHeight:null
    });
    LocalContractStorage.defineMapProperty(this, "indexToBalloon", {
        parse: function (text) {
            return new Balloon(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}
ConfessBalloon.prototype={
    init:function(){
        this.builder=Blockchain.transaction.from;
        this.balloonIndex=0;
        this.defaultHeight=100;
    },
    _dateFormat:function(birth){ 
        var date=new Date(birth*1000);
        return date.getMonth()+1+'-'+date.getDate()+'-'+date.getFullYear();
    },
    _verAddress:function(addr){
        if (!Blockchain.verifyAddress(addr)) {
            throw new Error("account address error")
        }
    },
    _getRand:function(){
        var max=20,min=10;
        return parseInt(Math.random()*(max-min+1)+min,10);
    },
    _isBuilder:function(addr){
         if(addr!==this.builder){
             throw new Error("you have no permission")
         }
    },
    _balloonOwner:function(id,addr){
        var bid=this.addressToIndex.get(addr);
        if (bid!==id) {
            throw new Error('balloon is not yours')
        }
    },
    _sort:function(arr){
        arr.sort(function(a,b){
            return b.height-a.height;
        	}
        );
        return arr;
    },
    pumpUp:function(id){
        var from=Blockchain.transaction.from;
        this._balloonOwner(id,from);
        var now=Blockchain.transaction.timestamp;
        var pumptime=this.indexToPumpTime.get(id);
        if (pumptime&&(now-pumptime<=520)) {
            throw new Error('520 seconds ago,you had already pumped up')
        }
        var height=this.indexToFlyHeight.get(id);
        height+=this._getRand();
        this.indexToFlyHeight.set(id,height);
        this.indexToPumpTime.set(id,now);
    },
    getBalloonByID:function(id){
        return this.indexToBalloon.get(id);
    },
    getBaseData:function(){
        var from=Blockchain.transaction.from;
        var result={};
        var balloons=[];
        for (var i = 1; i <= this.balloonIndex; i++) {
            var ball={}
            var b=this.indexToBalloon.get(i);
            ball.id=i;
            ball.text = b.text;
            ball.toName=b.toName;
            ball.toAddr = b.toAddr;
            ball.fromName =b.fromName;
            ball.fromAddr = b.fromAddr;
            ball.time=b.time;
            ball.pumpTime=this.indexToPumpTime.get(i);
            ball.height =this.indexToFlyHeight.get(i);
            balloons.push(ball);
        }
        //sort
        balloons= this._sort(balloons)
        result['balloons']=balloons;
        result['account']=from;
        return result;
    },


    addBalloon:function(toName,toAddr,text,fromName){
        var fromAddr=Blockchain.transaction.from;
        if (this.addressToIndex.get(fromAddr)) {
            throw new Error('you can only have an balloon');
        }
        this._verAddress(toAddr);
        toName=toName.trim();
        fromName=fromName.trim();
        text=text.trim();
        if (toName === ""||text===""||fromName=="" ){
            throw new Error("empty name/text");
        }
        if (text.length > 100 ||toName.length>10 ||fromName.length>10){
            throw new Error("text(100)/name(10) exceed limit length")
        }
        
        var time=Blockchain.transaction.timestamp;
        
        this.balloonIndex++;
        var balloon=new Balloon();
        balloon.text = text;
        balloon.toName=toName;
	    balloon.toAddr = toAddr;
	    balloon.fromName = fromName;
        balloon.fromAddr = fromAddr;
        balloon.time =time;
        this.addressToIndex.set(fromAddr,this.balloonIndex);
        this.indexToFlyHeight.set(this.balloonIndex,this.defaultHeight)
        this.indexToBalloon.set(this.balloonIndex,balloon);
        
    }


}

module.exports = ConfessBalloon;


"use strict";

var Emoticon = function(str) {
	if (str) {
		var obj = JSON.parse(str);
		this.name = obj.name;
        this.pic = obj.pic;
		this.creator = obj.creator;
	} else {
	    this.name = "";
	    this.pic = "";
	    this.creator = "";
	}
};

Emoticon.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var EmoticonFight=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        emoIndex: null
    });
    LocalContractStorage.defineMapProperties(this,{ 
        addrToEmoId:null,
        addrIdToPowTime:null, 
        addrIdToAttackTime:null,
        indexToPowNum:null,
        addrSerToResult:null
    });
    LocalContractStorage.defineMapProperty(this, "indexToEmoticon", {
        parse: function (text) {
            return new Emoticon(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

EmoticonFight.prototype={
    init:function(builder){
        this.builder=builder;
        this.emoIndex=0;
    },
    _isBuilder:function(addr){
         if(addr!==this.builder){
             throw new Error("you have no permission")
         }
    },
    _sort:function(arr){
        arr.sort(function(a,b){
            return b.pow-a.pow;
        	}
        );
        return arr;
    },
    _getRand:function(min,max){
        return parseInt(Math.random()*(max-min+1)+min,10);
    },
    getEmoticonByID:function(id){
        return this.indexToEmoticon.get(id);
    },
    _getEmoticon:function(id){
        var emoticon={}
        var emo=this.indexToEmoticon.get(id);
        emoticon.id=id;
        emoticon.name = emo.name;
        emoticon.pic=emo.pic;
        emoticon.pow=this.indexToPowNum.get(id);
        emoticon.creator=emo.creator;
        return emoticon;
    },
    getAllEmoticons:function(){
        var emoticons=[];
        for (var i = 1; i <= this.emoIndex; i++) {
            var emo=this._getEmoticon(i);
            emoticons.push(emo);
        }
        //sort
        emoticons= this._sort(emoticons)
        return emoticons;
    },
    
    getBaseData:function(){
        var from=Blockchain.transaction.from;
        var myemoid=this.addrToEmoId.get(from);
        var result={};
        result['myemoid']=myemoid;
        result['emoticons']=this.getAllEmoticons();
        result['account']=from;
        return result;
    },
    

    powerEmoticon:function(id){
        var from=Blockchain.transaction.from;
        var now=Blockchain.transaction.timestamp;
        var powtime=this.addrIdToPowTime.get(from+'_'+id);
        if (powtime&&(now-powtime<=3600*12)) {
            throw new Error('12 hours ago,you had already powered it')
        }
        var pn=this.indexToPowNum.get(id);
        if(!pn) pn=0;
        pn+=this._getRand(100,500);
        this.indexToPowNum.set(id,pn);
        this.addrIdToPowTime.set(from+'_'+id,now);
    },

    attackEmoticon:function(toId,serial){
        var from=Blockchain.transaction.from;
        var fromId=this.addrToEmoId.get(from);
        if(!fromId) throw new Error('You have not emoticon');
        var now=Blockchain.transaction.timestamp;
        var atime=this.addrIdToAttackTime.get(from+'_'+fromId);
        if (atime&&(now-atime<=3600*2)) {
            throw new Error('Attack cooling time : 2 hours')
        }
        var fromPowNum=this.indexToPowNum.get(fromId);
        var toPowNum=this.indexToPowNum.get(toId);
        if(toPowNum<100){
            throw new Error('Attack failed !')
        }
        var result="";
        var diff=fromPowNum-toPowNum;
        var roll=this._getRand(0,100);
        var prob=(diff/toPowNum)*100;
        if (diff>0&&roll<prob){
            var win=parseInt(toPowNum*0.5);
            fromPowNum+=win;
            toPowNum-=win;
            prob=prob>100?100:prob.toFixed(2)
            result='攻击成功，获取能量：'+win+'，概率：'+prob.toFixed(2)+'%';
            this.addrIdToAttackTime.set(from+'_'+fromId,now)
        }else{
            var lose=parseInt(fromPowNum*0.5);
            fromPowNum-=lose;
            prob=prob<0?0:prob.toFixed(2)
            result='攻击失败，损失能量:'+lose+'，概率：'+prob+'%';
        }
        this.indexToPowNum.set(fromId,fromPowNum);
        this.indexToPowNum.set(toId,toPowNum);
        this.addrSerToResult.set(from+'_'+serial,result);
       
    },
    getAttackResult:function(serial){
        var from=Blockchain.transaction.from;
        return this.addrSerToResult.get(from+'_'+serial);
    },
    createEmoticon:function(name,pic){
        name=name.trim();
        pic=pic.trim();
        if (pic==""){
            throw new Error("empty pic url");
        }
        if (name.length > 10 ){
            throw new Error("name exceed limit length")
        }
        var from=Blockchain.transaction.from;
        this.emoIndex++;
        var emo=new Emoticon();
        emo.name=name;
        emo.pic=pic;
        emo.creator=from;

        this.indexToPowNum.set(this.emoIndex,1000);
        this.addrToEmoId.set(from,this.emoIndex);
        this.indexToEmoticon.set(this.emoIndex,emo);
        
    }
}

module.exports = EmoticonFight;




"use strict";

var Status = function(str) {
	if (str) {
		var obj = JSON.parse(str);
		this.text = obj.text;
        this.time = obj.time;
        this.name = obj.name;
		this.from = obj.from;
	} else {
	    this.text = "";
        this.time = "";
        this.name = "";
	    this.from = "";
	}
};

Status.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var TrueOrFalse=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        statusIndex: null
    });
    LocalContractStorage.defineMapProperties(this,{ 
        indexToTrueCount:null,  
        indexToFalseCount:null,
        addrIdToSelect:null
    });
    LocalContractStorage.defineMapProperty(this, "indexToStatus", {
        parse: function (text) {
            return new Status(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

TrueOrFalse.prototype={
    init:function(){
        this.builder=Blockchain.transaction.from;
        this.statusIndex=0;
    },
    _dateFormat:function(time){ 
        var date=new Date(time*1000);
        return date.getMonth()+1+'-'+date.getDate()+'-'+date.getFullYear();
    },
    _isBuilder:function(addr){
         if(addr!==this.builder){
             throw new Error("you have no permission")
         }
    },
    getStatusByID:function(id){
        return this.indexToStatus.get(id);
    },
    getBaseData:function(){
        var from=Blockchain.transaction.from;
        var result={};
        result['status']=[];
        for (var i = 1; i <= this.statusIndex; i++) {
            var stat={};
            var s=this.indexToStatus.get(i);
            stat.id=i;
            stat.text=s.text;
            stat.name=s.name;
            stat.from=s.from;
            stat.trueCount=this.indexToTrueCount.get(i);
            stat.falseCount=this.indexToFalseCount.get(i);
            result['status'].push(stat);
        }
        result['account']=from;
        return result;
    },

    statusDecision:function(id,select){
        select=parseInt(select);
        var from=Blockchain.transaction.from;
        var sel=this.addrIdToSelect.get(from+'_'+id);
        if(sel!==null){
            throw new Error('You have made a choice!')
        }
        if(select){
            var tc=this.indexToTrueCount.get(id);
            tc++;
            this.indexToTrueCount.set(id,tc);
        }else{
            var fc=this.indexToFalseCount.get(id);
            fc++;
            this.indexToFalseCount.set(id,fc);
        }
        this.addrIdToSelect.set(from+'_'+id,select);
    },

    postStatus:function(text,name){
        text=text.trim();
        name=name.trim();
        if (text === ""||name===""){
            throw new Error("empty status/name");
        }
        if (text.length > 100 ||name.length>10){
            throw new Error("status/name exceed limit length ")
        }
        var from=Blockchain.transaction.from;
        var time=Blockchain.transaction.timestamp;
        
        this.statusIndex++;
        var status=new Status();
        status.text=text;
        status.name=name;
        status.time=time;
        status.from=from;

        this.indexToStatus.set(this.statusIndex,status);
        
    }


}

module.exports = TrueOrFalse;
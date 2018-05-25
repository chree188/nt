"use strict";

var Status = function(str) {
	if (str) {
		var obj = JSON.parse(str);
		this.text = obj.text;
        this.time = obj.time;
		this.author = obj.author;
	} else {
	    this.text = "";
	    this.time = "";
	    this.author = "";
	}
};

Status.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var UnHappy=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        statusIndex: null,
        getLimit:null
    });
    LocalContractStorage.defineMapProperties(this,{
        addressToName: null,
        addressToLikes: null,
        addressToStatusIds:null,
        indexToLikeCount:null
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

UnHappy.prototype = {
    init:function(){
        this.builder=Blockchain.transaction.from;
        this.statusIndex=0;
        this.getLimit=5;
    },
    register:function(name){
        var from=Blockchain.transaction.from;
        if (name === ""){
            throw new Error("name can not be empty");
        }
        if (name.length > 10 ){
            throw new Error("name exceed limit length")
        }
        this.addressToName.set(from,name);
    },
    getAccount:function(){
        var from=Blockchain.transaction.from;
        var result={};
        result['name']=this.addressToName.get(from);
        result['likeCount']=this._getMyLikeCount(from);
        result['account']=from;
        return result;
    },
    _getStatusByID:function(id){
        var stat={}
        var status=this.indexToStatus.get(id);
        stat.id=id;
        stat.text=status.text;
        stat.time=status.time;
        stat.from=status.author;
        stat.name=this.addressToName.get(status.author);
        stat.like=this.indexToLikeCount.get(id);
        return stat;
    },
    _getMyLikeCount:function(from){
        var statusIds=this.addressToStatusIds.get(from);
        if(!statusIds) return 0;
        var likeCount=0;
        statusIds.forEach(i => {
            var count=this.indexToLikeCount.get(i);
            likeCount+=count;
        });
        return likeCount
    },
    getStatuses:function(pid){
        var arr=[];
        pid=parseInt(pid);
        var index=pid>0?(pid-1):this.statusIndex;
        for (var i = index; i > 0; i--) {
            var stat=this._getStatusByID(i)
            arr.push(stat);
            if(arr.length>=this.getLimit) return arr;
        }
        return arr;
    },
    _getMyStat:function(statusIds){
        var arr=[];
        if(!statusIds) statusIds=[];
        for (var i = statusIds.length; i > 0; i--) {
            var stat=this._getStatusByID(statusIds[i-1])
            arr.push(stat);
        }
        return arr;
    },
    getMyStatuses:function(){
        var from=Blockchain.transaction.from;
        var statusIds=this.addressToStatusIds.get(from);
        return this._getMyStat(statusIds);
    },
    getMyLikes:function(){
        var from=Blockchain.transaction.from;
        var statusIds=this.addressToLikes.get(from);
        return this._getMyStat(statusIds);
    },
    _checkName:function(from){
        if(!this.addressToName.get(from)) {
            throw new Error('You have to set a nickname');
        }
    },
    likeStatus:function(id){
        var from=Blockchain.transaction.from;
        this._checkName(from);
        var likearr=this.addressToLikes.get(from);
        if(!likearr) likearr=[]
        likearr.forEach(index => {
            if (index===id) throw new Error('You are already liked it!')
        });
        likearr.push(id);
        var like=this.indexToLikeCount.get(id);
        like++;
        this.indexToLikeCount.set(id,like);
        this.addressToLikes.set(from,likearr)
    },
    postStatus:function(text){
        text=text.trim();
        if (text.length > 255 ){
            throw new Error("status exceed limit length")
        }
        var from=Blockchain.transaction.from;
        this._checkName(from);
        var time=Blockchain.transaction.timestamp;
        this.statusIndex++;
        var status=new Status();
        status.text=text;
        status.time=time;
        status.author=from;
        this.indexToStatus.set(this.statusIndex,status);
        var statuses= this.addressToStatusIds.get(from);
        if(!statuses) statuses=[];
        statuses.push(this.statusIndex);
        this.addressToStatusIds.set(from,statuses);
    }

}
module.exports = UnHappy;
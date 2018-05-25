"use strict";

var LightContract = function () {
	LocalContractStorage.defineMapProperty(this, "userData");
	LocalContractStorage.defineProperty(this, "globalData");
	LocalContractStorage.defineProperty(this, "super");
	LocalContractStorage.defineProperty(this, "showCount");
};
LightContract.prototype = {
	init: function () {
        var uid = Blockchain.transaction.from;
		this.super = uid;
		this.showCount = 10;
		this.globalData = [];
	},
	_newGlobalRecord:function(level,seconds){
		level = parseInt(level);
		seconds = parseInt(seconds);
        var uid = Blockchain.transaction.from;
        var obj = this.globalData;
        if(obj.length === 0){
			var addrs = [];
			addrs.push(uid);
        	obj.push({level:level,time:seconds,addr:addrs}); 
        }
        else{
        	for(var i=0;i<obj.length;++i){
        		if(level < obj[i].level
        			|| level === obj[i].level && seconds > obj[i].time){
        			continue;
        		}
        		else if(level === obj[i].level && seconds === obj[i].time){
        			if(obj[i].addr.indexOf(uid) === -1){
        				obj[i].addr.push(uid);
        			}
        			break;
        		}
        		else{
        			var addrs = [];
					addrs.push(uid);
        			obj.splice(i,0,{level:level,time:seconds,addr:addrs});
        			if(obj.length > this.showCount){
        				obj = obj.slice(0,this.showCount);
        			}
        			break;
        		}
        	}
        	if(i === obj.length && i < this.showCount){
        		var addrs = [];
				addrs.push(uid);
        		obj.push({level:level,time:seconds,addr:addrs}); 
        	}
        }
        this.globalData = obj;
	},
	newUserRecord:function(level,seconds){
        var uid = Blockchain.transaction.from;
        var record = this.userData.get(uid);
        if(record === null){
        	record = {level:level,time:seconds};
        }
        else{
        	if(record.level > level || record.level === level && record.time <= seconds){
        		throw new Error("old record level: " + record.level + " time: " + record.time + " is better than current level: " + level 
        			+" time: " + seconds);
        	}
        	record.level = level;
        	record.time = seconds;
        }
        this.userData.set(uid,record);
        this._newGlobalRecord(level,seconds);
	},
	getUserRecord:function(){
        var uid = Blockchain.transaction.from;
        return this.userData.get(uid);
	},
	getGlobalRecord:function(){
		return this.globalData;
	},
	setShowAccountCount:function(count){
		count = parseInt(count);
        var uid = Blockchain.transaction.from;
		if(uid !== self.super){
			return;
		}
		this.showCount = count;
	}
};
module.exports = LightContract;

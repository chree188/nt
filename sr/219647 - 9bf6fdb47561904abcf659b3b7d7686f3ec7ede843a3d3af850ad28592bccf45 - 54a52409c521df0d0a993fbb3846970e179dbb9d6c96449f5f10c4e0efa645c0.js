"use strict";
var BlackSwanEvent = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.evnet_name = obj.evnet_name;
        this.profession = obj.profession;
        this.score = obj.score;
        this.author = obj.author;
        this.describe = obj.describe;
        this.date = obj.date;
    } else {
        this.evnet_name = "";
        this.author = "";
        this.profession = "";
        this.score = "";
        this.describe = "";
        this.date = "";
    }
};
BlackSwanEvent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var BlackSwanEventContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new BlackSwanEvent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this,"arrayMap");
    LocalContractStorage.defineMapProperty(this,"dataMap");
    LocalContractStorage.defineProperty(this,"size");
    LocalContractStorage.defineProperty(this,"top10BlackSwanEvents");
};
BlackSwanEventContract.prototype = {
    init: function () {
        this.size = 0;
    },
    getTop10:function(){
        return this.top10BlackSwanEvents;
    },
    sort:function(){
        var size = this.size;
        var result = [];
        var max = 999999999;
        for(var i=0;i<size;i++){
            var temp = -1;
            var temp_map = this.dataMap.get(this.arrayMap.get(i));
            for(var k=0;k<size;k++){
                if(this.dataMap.get(this.arrayMap.get(k)).score>=max){
                    continue;
                }
                if(this.dataMap.get(this.arrayMap.get(k)).score>temp){
                    temp = this.dataMap.get(this.arrayMap.get(k)).score;
                    temp_map = this.dataMap.get(this.arrayMap.get(k));
                }
            }
            result[i] = temp_map;
            max = temp;
        }
        var top = 10;
        if(size<top){
            top = size;
        }
        var top10 = result.slice(0,top);
        LocalContractStorage.set("top10BlackSwanEvents",top10);
        return top10;
    },
    save: function (evnet_name, profession, describe, date) {
        var score = 1;
        profession = profession.trim();
        describe = describe.trim();
        evnet_name = evnet_name.trim();
        if (evnet_name === ""){
            throw new Error("empty evnet_name");
        }
        var from = Blockchain.transaction.from;
        var BlackSwanEvent = this.repo.get(evnet_name);
        if (BlackSwanEvent){
            throw new Error("evnet_name has been occupied");
        }
        BlackSwanEvent = new BlackSwanEvent();
        BlackSwanEvent.author = from;
        BlackSwanEvent.describe = describe;
        BlackSwanEvent.profession = profession;
        BlackSwanEvent.evnet_name = evnet_name;
        BlackSwanEvent.score = score;
        BlackSwanEvent.date = date;
        this.repo.put(evnet_name, BlackSwanEvent);
        var index = this.size;
        this.arrayMap.set(index,evnet_name);
        this.dataMap.set(evnet_name,BlackSwanEvent);
        this.size += 1;
        this.sort();
        return BlackSwanEvent;
    },
    get: function (evnet_name) {
        evnet_name = evnet_name.trim();
        if ( evnet_name === "" ) {
            throw new Error("empty evnet_name")
        }
        return this.repo.get(evnet_name);
    },
    like:function(evnet_name){
        if(evnet_name){
            var BlackSwanEvent = this.get(evnet_name);
            var score = BlackSwanEvent.score;
            score += 1;
            BlackSwanEvent.score = score;
            this.dataMap.set(evnet_name,BlackSwanEvent);
            this.repo.set(evnet_name,BlackSwanEvent);
            this.sort();
            return BlackSwanEvent;
        }else{
            throw new Error("input event name is not valid");
        }
    },
    notlike:function(evnet_name){
        if(evnet_name){
            var BlackSwanEvent = this.get(evnet_name);
            var score = BlackSwanEvent.score;
            score -= 1;
            if(score<0){
                score = 0;
            }
            BlackSwanEvent.score = score;
            this.dataMap.set(evnet_name,BlackSwanEvent);
            this.repo.put(evnet_name,BlackSwanEvent);
            this.sort();
            return BlackSwanEvent;
        }else{
            throw new Error("input event name is not valid");
        }
    },
    len:function(){
        return this.size;
    },
    forEach:function(limit,offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
            throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number>this.size){
            number = this.size;
        }
        var result = [];
        var j = 0;
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result[j] = '{"evnet_name":"'+object.evnet_name+'","profession":"'+object.profession+'",describe":"'+object.describe+'","score:"'+object.score+'","author:"'+object.author+'","date":"'+object.date+'"}';
            j++;
        }
        return result;
    }
};
module.exports = BlackSwanEventContract;
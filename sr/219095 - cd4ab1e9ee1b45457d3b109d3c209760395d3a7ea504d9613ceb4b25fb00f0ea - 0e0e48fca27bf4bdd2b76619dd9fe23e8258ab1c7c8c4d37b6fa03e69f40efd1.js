"use strict";
var InfluentialFamous = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.famous_name = obj.famous_name;
        this.profession = obj.profession;
        this.portrait = obj.portrait;
        this.score = obj.score;
        this.author = obj.author;
        this.describe = obj.describe;
        this.date = obj.date;
    } else {
        this.famous_name = "";
        this.profession = "";
        this.portrait = "";
        this.author = "";
        this.score = "";
        this.describe = "";
        this.date = "";
    }
};
InfluentialFamous.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var InfluentialFamousContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new InfluentialFamous(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this,"arrayMap");
    LocalContractStorage.defineMapProperty(this,"dataMap");
    LocalContractStorage.defineProperty(this,"size");
    LocalContractStorage.defineProperty(this,"top100InfluentialFamouss");
};
InfluentialFamousContract.prototype = {
    init: function () {
        this.size = 0;
    },
    gettop100:function(){
        return this.top100InfluentialFamouss;
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
        var top = 100;
        if(size<top){
            top = size;
        }
        var top100 = result.slice(0,top);
        LocalContractStorage.set("top100InfluentialFamouss",top100);
        return top100;
    },
    save: function (famous_name, profession, portrait, describe, date) {
        var score = 1;
        describe = describe.trim();
        portrait = portrait.trim();
        profession = profession.trim();
        famous_name = famous_name.trim();
        if (famous_name === ""){
            throw new Error("empty famous_name");
        }
        var from = Blockchain.transaction.from;
        var InfluentialFamous = this.repo.get(famous_name);
        if (InfluentialFamous){
            throw new Error("famous name has been occupied");
        }
        InfluentialFamous = new InfluentialFamous();
        InfluentialFamous.author = from;
        InfluentialFamous.describe = describe;
        InfluentialFamous.famous_name = famous_name;
        InfluentialFamous.profession = profession;
        InfluentialFamous.portrait = portrait;
        InfluentialFamous.score = score;
        InfluentialFamous.date = date;
        this.repo.put(famous_name, InfluentialFamous);
        var index = this.size;
        this.arrayMap.set(index,famous_name);
        this.dataMap.set(famous_name,InfluentialFamous);
        this.size += 1;
        this.sort();
        return InfluentialFamous;
    },
    get: function (famous_name) {
        famous_name = famous_name.trim();
        if ( famous_name === "" ) {
            throw new Error("empty famous_name")
        }
        return this.repo.get(famous_name);
    },
    like:function(famous_name){
        if(famous_name){
            var InfluentialFamous = this.get(famous_name);
            var score = InfluentialFamous.score;
            score += 1;
            InfluentialFamous.score = score;
            this.dataMap.set(famous_name,InfluentialFamous);
            this.repo.set(famous_name,InfluentialFamous);
            this.sort();
            return InfluentialFamous;
        }else{
            throw new Error("input famous name is not valid");
        }
    },
    notlike:function(famous_name){
        if(famous_name){
            var InfluentialFamous = this.get(famous_name);
            var score = InfluentialFamous.score;
            score -= 1;
            if(score<0){
                score = 0;
            }
            InfluentialFamous.score = score;
            this.dataMap.set(famous_name,InfluentialFamous);
            this.repo.put(famous_name,InfluentialFamous);
            this.sort();
            return InfluentialFamous;
        }else{
            throw new Error("input famous name is not valid");
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
            result[j] = '{"famous_name":"'+object.famous_name+'","profession":"'+object.profession+'","portrait":"'+object.portrait+'",describe":"'+object.describe+'","score:"'+object.score+'","author:"'+object.author+'","date":"'+object.date+'"}';
            j++;
        }
        return result;
    }
};
module.exports = InfluentialFamousContract;
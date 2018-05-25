"use strict";
var InnovatingEnterprise = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.enterprise_name = obj.enterprise_name;
        this.profession = obj.profession;
        this.portrait = obj.portrait;
        this.score = obj.score;
        this.author = obj.author;
        this.describe = obj.describe;
        this.date = obj.date;
    } else {
        this.enterprise_name = "";
        this.profession = "";
        this.portrait = "";
        this.author = "";
        this.score = "";
        this.describe = "";
        this.date = "";
    }
};
InnovatingEnterprise.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var InnovatingEnterpriseContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new InnovatingEnterprise(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this,"arrayMap");
    LocalContractStorage.defineMapProperty(this,"dataMap");
    LocalContractStorage.defineProperty(this,"size");
    LocalContractStorage.defineProperty(this,"innovatingEnterpriseRanking");
};
InnovatingEnterpriseContract.prototype = {
    init: function () {
        this.size = 0;
    },
    getRanking:function(){
        return this.innovatingEnterpriseRanking;
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
        LocalContractStorage.set("innovatingEnterpriseRanking",result);
        return result;
    },
    save: function (enterprise_name, profession, portrait, describe, date) {
        var score = 1;
        describe = describe.trim();
        portrait = portrait.trim();
        profession = profession.trim();
        enterprise_name = enterprise_name.trim();
        if (enterprise_name === ""){
            throw new Error("empty enterprise_name");
        }
        var from = Blockchain.transaction.from;
        var innovatingEnterprise = this.repo.get(enterprise_name);
        if (innovatingEnterprise){
            throw new Error("enterprise name has been occupied");
        }
        innovatingEnterprise = new InnovatingEnterprise();
        innovatingEnterprise.author = from;
        innovatingEnterprise.describe = describe;
        innovatingEnterprise.enterprise_name = enterprise_name;
        innovatingEnterprise.profession = profession;
        innovatingEnterprise.portrait = portrait;
        innovatingEnterprise.score = score;
        innovatingEnterprise.date = date;
        this.repo.put(enterprise_name, innovatingEnterprise);
        var index = this.size;
        this.arrayMap.set(index,enterprise_name);
        this.dataMap.set(enterprise_name,innovatingEnterprise);
        this.size += 1;
        this.sort();
        return innovatingEnterprise;
    },
    get: function (enterprise_name) {
        enterprise_name = enterprise_name.trim();
        if ( enterprise_name === "" ) {
            throw new Error("empty enterprise_name");
        }
        return this.repo.get(enterprise_name);
    },
    comment:function(enterprise_name,describe){
        if(enterprise_name==="" || describe===""){
            throw new Error("empty enterprise_name/describe");
        }
        enterprise_name = enterprise_name.trim();
        describe = describe.trim();
        var innovatingEnterprise = this.repo.get(enterprise_name);
        var describe_ = innovatingEnterprise.describe;
        var json_ = JSON.parse(describe_);
        var json = JSON.parse(describe);
        json_.push(json[0]);
        var des = JSON.stringify(json_);
        innovatingEnterprise.describe = des;
        this.repo.set(enterprise_name,innovatingEnterprise);
        return des;
    },
    like:function(enterprise_name){
        if(enterprise_name){
            var innovatingEnterprise = this.get(enterprise_name);
            var score = innovatingEnterprise.score;
            score += 1;
            innovatingEnterprise.score = score;
            this.dataMap.set(enterprise_name,innovatingEnterprise);
            this.repo.set(enterprise_name,innovatingEnterprise);
            this.sort();
            return innovatingEnterprise;
        }else{
            throw new Error("input enterprise name is not valid");
        }
    },
    notlike:function(enterprise_name){
        if(enterprise_name){
            var innovatingEnterprise = this.get(enterprise_name);
            var score = innovatingEnterprise.score;
            score -= 1;
            if(score<0){
                score = 0;
            }
            innovatingEnterprise.score = score;
            this.dataMap.set(enterprise_name,innovatingEnterprise);
            this.repo.put(enterprise_name,innovatingEnterprise);
            this.sort();
            return innovatingEnterprise;
        }else{
            throw new Error("input enterprise name is not valid");
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
            result[j] = '{"enterprise_name":"'+object.enterprise_name+'","profession":"'+object.profession+'","portrait":"'+object.portrait+'",describe":"'+object.describe+'","score:"'+object.score+'","author:"'+object.author+'","date":"'+object.date+'"}';
            j++;
        }
        return result;
    }
};
module.exports = InnovatingEnterpriseContract;
"use strict";

var JobItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.company = obj.company;
        this.telePhone = obj.telePhone;
		this.dateTime = obj.dateTime;
        this.author = obj.author;
	} else {
	    this.name = "";
	    this.company = "";
        this.telePhone = "";
	    this.dateTime = "";
        this.author = "";
	}
};

JobItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperJob = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new JobItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

SuperJob.prototype = {
    init: function () {
        this.size = 0;
    },

    save: function (name, company, telePhone) {

        name = name.trim();
        company = company.trim();
        telePhone = telePhone.trim();
        var dateTime = new Date().getTime();

        var key = name + dateTime;
        if (name === "" || company === "" || telePhone === ""){
            throw new Error("empty key / value");
        }
        if (company.length > 64 || telePhone.length > 64 || name.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var jobItem = this.repo.get(key);
        if (jobItem){
            throw new Error("活动已存在");
        }

        jobItem = new JobItem();
        jobItem.name = name;
        jobItem.company = company;
        jobItem.author = from;
        jobItem.telePhone = telePhone;
        jobItem.dateTime = dateTime;

        this.repo.put(key, jobItem);

        var index = this.size;
        this.arrayMap.set(index, key);
        this.size +=1;
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(name);
    },

    /*del: function(name) {
        var result = this.repo.del(“name”);
        console.log(result); 
        // delete 操作相当于 del
    },*/
    forEach: function(limit, offset){

        if(this.size === 0){
            return null;
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = [];
        for(var i=offset;i<number;i++){

            var name = this.arrayMap.get(i);
            var jobItem = this.repo.get(name);
            var temp={
                index:i,
                value:jobItem
            }
            result.push(temp);
        }
        return JSON.stringify(result);
    }
};
module.exports = SuperJob;
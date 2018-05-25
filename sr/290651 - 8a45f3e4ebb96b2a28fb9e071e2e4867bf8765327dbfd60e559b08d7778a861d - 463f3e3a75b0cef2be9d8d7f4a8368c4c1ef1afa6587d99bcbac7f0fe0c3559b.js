
"use strict";


var JobItem = function(text){
    if (text) {
		var obj = JSON.parse(text);
		this.title = obj.title;
		this.desc = obj.desc;
        this.city = obj.city;
        this.education = obj.education;
        this.salary = obj.salary;
        this.key = obj.key;//user addr
        this.id = obj.id;
        this.resumeJob = obj.resumeJob;
	} else {
	    this.title = "";
		this.desc = "";
        this.city ="";
        this.education = "";
        this.salary = "";
        this.key ="";
        this.id = "";
        this.resumeJob =[];
	}
}
JobItem.prototype = {
    toString: function () {
      return JSON.stringify(this);
    }
};
var ResumeJob = function(text){
    if (text) {
		var obj = JSON.parse(text);
		this.fid = obj.fid;
		this.title = obj.title;
        this.toAdd = obj.toAdd;
        this.fromAdd = obj.fromAdd;
        this.count = obj.count;
	} else {
		this.fid = "";
		this.title = "";
        this.toAdd = "";
        this.fromAdd = "";
        this.count = "";
	}
}
ResumeJob.prototype = {
    toString: function () {
      return JSON.stringify(this);
    }
};


var Contract = function () {
    LocalContractStorage.defineMapProperty(this, "job", {
        parse: function (text) {
            return new JobItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this,"jobArray", {
        parse: function (text) {
            return new JobItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    })

    LocalContractStorage.defineMapProperty(this, "jobsKey");
    LocalContractStorage.defineProperty(this, "size");
};

Contract.prototype = {

    init: function () {
        this.size=0;
    },
    _verifyAddress: function (address) {
		// 1-valid, 0-invalid
		var result = Blockchain.verifyAddress(address);
		return {
			valid: result == 0 ? false : true
		};
	},
    save: function(title,desc,city,education,salary,key){
        key = key.trim();
        if (key === "") {
            throw new Error("empty key / value");
        }
        if(!this._verifyAddress(key)){
            throw new  Error("address is not valid")
        }

        var jobItem = new JobItem();
        jobItem.city = city;
        jobItem.desc = desc;
        jobItem.education = education;
        jobItem.salary = salary;
        jobItem.title =  title;
        jobItem.key = key;
        jobItem.id = this.size+"";
        jobItem.resumeJob=[];
        var index = this.size;

        // this.jobsKey.set(index,key);
        // this.job.set(key, jobItem);
        this.jobArray.set(index,jobItem);
        // this.jobid.set(index+"",jobItem);

        this.size = index + 1;
        return this.size
    },
    resumeJob: function(id,title,toAdd,count){
        var _resumeJob = new ResumeJob();
        _resumeJob.count = count;
        _resumeJob.fid = id;
        _resumeJob.title = title;
        _resumeJob.toAdd = toAdd;
        _resumeJob.fromAdd =  Blockchain.transaction.from;

        var item =  this.jobArray.get(id);
        item.resumeJob.push(_resumeJob);
        this.jobArray.set(id, item);
    },
    getJob:function(userAddr){
        userAddr = userAddr.trim();
        if (userAddr === "") {
          throw new Error("empty userAddr")
        }
        return this.job.get(userAddr);
    },
    getAll: function (limit,offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        var number = offset * (limit+1);
        if(number > this.size){
          number = this.size;
        }
        var list = [];
        for(var i=limit;i<number;i++){
        //   var key = this.jobsKey.get(i);
          var object = this.jobArray.get(i);
          list.push(object);
        }
        return list
    }

};
module.exports = Contract;
"use strict";

var VoteContract = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineProperty(this, "size");
};

VoteContract.prototype = {
    init: function () {
        this.size = 0;
    },

    //key = identifier 
    //value 提交格式为:["name":"Rick","zanFlag":"false","zanIdentifier":"","campaignFlag":"true","motto":"hello world","SupportNum":"10"]
    //使用 "-.-.-" 作为连接
    //name:Rick-.-.-zanFlag:false-.-.-zanIdentifier:null-.-.-campaignFlag:true-.-.-motto:hello world-.-.-SupportNum:10
    set: function (key, value) {

    	key = key.trim();
    	value = value.trim();
    	// var from = Blockchain.transaction.from;

        //判断 key 是否注册过,如果注册过则不能重复注册
        var object = this.dataMap.get(key);
        if (object == null) {
            var index = this.size;
            this.arrayMap.set(index, key);
            this.dataMap.set(key, value);
            this.size +=1;
        } else {
            throw new Error(key + " is exist.");
        }
    },

    //获取某个用户信息
    get: function (key) {
        return this.dataMap.get(key);
    },

    len:function(){
      return this.size;
    },

    //遍历竞选者
    forEachCandidate: function(limit, offset){
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
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);

            //查看是否为竞争者
            var object = this.dataMap.get(key);
    		var contentstr = object.split("-.-.-");
    		var valueContentstr = contentstr[3].split(":");
			var campaignFlag = valueContentstr[1];
            if (campaignFlag == "true") {
            	var temp={
                	index:i,
                	key:key,
                	value:object
            	}
            	result.push(temp);
            }

        }
        return JSON.stringify(result);
    },

    //遍历所有人
    forEach: function(limit, offset){
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
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            var temp={
                index:i,
                key:key,
                value:object
            }
            result.push(temp);
        }
        return JSON.stringify(result);
    },

    getZanFlag : function(key) {
    	var object = this.dataMap.get(key);
    	var contentstr = object.split("-.-.-");
    	var valueContentstr = contentstr[1].split(":");
    	var value = valueContentstr[1];
    	return value
    },

    getCampaignFlag : function(key) {
    	var object = this.dataMap.get(key);
    	var contentstr = object.split("-.-.-");
    	var valueContentstr = contentstr[3].split(":");
		var value = valueContentstr[1];
    	return value
    },

    setZan : function(key,candidateKey) {
    	//判断点赞者是否存在
    	var object = this.dataMap.get(key);
    	if (!object) {
    		throw new Error(key + "does not exist.");
    	}

    	//判断点赞者是否已经投过票
    	var contentstr = object.split("-.-.-");
    	var valueContentstr = contentstr[1].split(":");
    	var zanFlag = valueContentstr[1];

    	//已经被赞对象的 key
    	var zanIdentifierStr = contentstr[2].split(":");
    	var zanIdentifier = zanIdentifierStr[1];
    	if (zanFlag == "true") {
    		throw new Error("object has sported: " + zanIdentifier);
    	}

    	//遍历identifier,判断传入者 candidateKey 是否存在
    	var candidateFlag = false;
    	for (var i = 0; i < this.size; i++) {
    		var eachkey = this.arrayMap.get(i);
    		if (eachkey == candidateKey) {
    			candidateFlag = true;
    			i = this.size;
    		}
    	}

    	//若不存在则抛错
    	if (candidateFlag == false) {
    		throw new Error("candidate doesn't exist");
    	}

    	//判断传入者是否为竞选者
    	var candidateObject = this.dataMap.get(candidateKey);
    	var candidate_contentstr = candidateObject.split("-.-.-");
    	var candidate_campaignFlag = candidate_contentstr[3];   //竞选者的 campaignFlag
    	var candidate_campaignFlagStr = candidate_contentstr[3].split(":");
    	if (candidate_campaignFlagStr[1] == "false") {				//传入者不是竞选者
    		throw new Error(candidateKey + "isn't candidate");
    	}

    	//若存在则改变点赞者的点赞状态(重新设置 value 的值,取出在传入),并设置zanIdentifier为当前传入的 candidateKey
    	var name = contentstr[0];				//点赞者的 name 
    	var campaignFlag = contentstr[3];		//点赞者的竞选状态
    	var motto = contentstr[4];				//点赞者的格言
    	var SupportNum = contentstr[5];			//点赞者的支持人数

    	var object_new_value = name + "-.-.-" + "zanFlag:true" + "-.-.-" + "zanIdentifier:"+ candidateKey + "-.-.-" + campaignFlag + "-.-.-"+ motto + "-.-.-" + SupportNum ;
    	this.dataMap.set(key,object_new_value);

    	//并且改变竞选者的支持人数个数属性 SupportNum 
    	var candidate_name = candidate_contentstr[0];			//竞选者的 name 
    	var candidate_zanFlag = candidate_contentstr[1];		//竞选者的 zanFlag	
    	var candidate_zanIdentifier = candidate_contentstr[2];  //竞选者的 zanIdentifier
    	// var candidate_campaignFlag = candidate_contentstr[3];   //竞选者的 campaignFlag
    	var candidate_motto = candidate_contentstr[4]; 			//竞选者的 motto

    	var SupportNumStr = candidate_contentstr[5].split(":");	//竞选者的 SupportNum
    	var SupportNum = SupportNumStr[1]; 
    	var new_supportNum = (parseInt(SupportNum) + 1).toString();
    	var candidate_new_value = candidate_name + "-.-.-" + candidate_zanFlag + "-.-.-" + candidate_zanIdentifier + "-.-.-" + candidate_campaignFlag + "-.-.-" + candidate_motto + "-.-.-" + "SupportNum:" + new_supportNum;
    	this.dataMap.set(candidateKey,candidate_new_value);
    },

};

module.exports = VoteContract;
"use strict";

var TopicInfo = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id
        this.title = obj.title;
        this.message = obj.message;
        this.publisher = obj.publisher;
        this.time = obj.time;
        this.size = obj.size;
        this.reward = obj.reward;
        this.rewardTime = obj.rewardTime;
        this.winner = obj.winner;
    }
};

TopicInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TopicMessage = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id
        this.message = obj.message;
        this.publisher = obj.publisher;
        this.time = obj.time;
    }
};

TopicMessage.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Result = function(method,ret,retTotal,requester) {
    this.method = method;
    this.ret = ret;
    this.retTotal = retTotal,
    this.requester = requester;
};

Result.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var MessageBoard = function () {
    LocalContractStorage.defineProperty(this,"ownerAddress"); //合约所有者地址
    LocalContractStorage.defineProperty(this,"commissionRate"); //主题数
    LocalContractStorage.defineProperty(this,"topicSize"); //主题数
    LocalContractStorage.defineMapProperty(this,
        "topicInfo", {
            parse: function (text) {
                return new TopicInfo(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    LocalContractStorage.defineMapProperty(this,
        "topicMessage", {
            parse: function (text) {
                return new TopicMessage(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
};

MessageBoard.prototype = {
    init: function () {
    	this.ownerAddress = "n1TNMPBC5s3fZZuodhuGa3VEHA7Bj9dckxR";
    	this.commissionRate = 0.05;
        this.topicSize = 0;
    },

    publishTopic: function(title,message){
        var reward = Blockchain.transaction.value;
        var topicInfo = new TopicInfo();
        topicInfo.id = this.topicSize;
        topicInfo.title = title;
        topicInfo.message = message;
        topicInfo.publisher = Blockchain.transaction.from;
        topicInfo.time = new Date().getTime()
        topicInfo.size = 0;
        topicInfo.winner = "";
        topicInfo.reward = reward*(1-this.commissionRate);//扣除手续费
        this.topicInfo.put(this.topicSize,topicInfo);
        this.topicSize +=1;

        var result = Blockchain.transfer(this.ownerAddress, reward*this.commissionRate);//将手续费转至所有者账号
        if(!result){
            throw new Error("transfer commission fail.");
        }
    },
    getTopics: function(offset,limit){
      offset = new Number(offset)
      limit = new Number(limit)
      if ( this.topicSize < offset) {
        throw new Error("offset Oversize");
      }
      var end = offset +limit;
      if(this.topicSize < end){
        end = this.topicSize;
      }
      var ret = []
      for(var i=offset;i<end;i++){
        ret.push(this.topicInfo.get(i))
      }
      return new Result("getTopics",ret,this.topicSize,Blockchain.transaction.from);
    },

    getTopicsDesc: function(offset,limit){
      offset = new Number(offset)
      limit = new Number(limit)
      if ( this.topicSize < offset) {
          throw new Error("offset Oversize");
      }
      var end = offset +limit;
      if(this.topicSize < end){
          end = this.topicSize;
      }
      var ret = []
      for(var i=this.topicSize - 1 -offset;i>this.topicSize -1 - end;i--){
          ret.push(this.topicInfo.get(i))
      }
      return new Result("getTopicsDesc",ret,this.topicSize,Blockchain.transaction.from);
    },

    replyTopic: function(topicId,message){
        if ( this.topicSize <= topicId) {
            throw new Error("topicId Oversize");
        }
        var topicInfo = this.topicInfo.get(topicId);
        var size = topicInfo.size;
        var topicMessage = new TopicMessage();
        topicMessage.id = size;
        topicMessage.message = message;
        topicMessage.publisher = Blockchain.transaction.from;
        topicMessage.time = new Date().getTime()
        this.topicMessage.put(topicId+":"+size,topicMessage);
        topicInfo.size = size +1
        this.topicInfo.put(topicInfo.id,topicInfo)
    },

    getMessage:function(topicId,offset,limit){
      offset = new Number(offset)
      limit = new Number(limit)
      if ( this.topicSize <= topicId) {
          throw new Error("topicId Oversize");
      }
      var topicInfo = this.topicInfo.get(topicId);
      if(topicInfo.size < offset){
          throw new Error("offset Oversize");
      }
      var end = offset +limit;
      if(topicInfo.size < end){
          end = topicInfo.size;
      }
      var ret = []
      for(var i=offset;i<end;i++){
          ret.push(this.topicMessage.get(topicId+":"+i))
      }
      var result = new Result("getMessage",ret,topicInfo.size,Blockchain.transaction.from);
      if(Blockchain.transaction.from == topicInfo.publisher){
          result.isPublisher = true;
      }else {
          result.isPublisher = false;
      }
      return result;
    },

    payReward:function(topicId,messageId,awardWinnerAddress){
        if ( this.topicSize <= topicId) {
            throw new Error("topicId Oversize");
        }
        var topicInfo = this.topicInfo.get(topicId);
        if(Blockchain.transaction.from != topicInfo.publisher){
            throw new Error("Permission denied.");
        }
        if(topicInfo.winner != ""){
            throw new Error("Paid the reward to"+topicInfo.winner);
        }
        if(topicInfo.size <= messageId){
            throw new Error("messageId Oversize");
        }
        var topicMessage = this.topicMessage.get(topicId+":"+messageId);
        if(topicMessage.publisher != awardWinnerAddress){
            throw new Error("Error awardWinnerAddress.");
        }
        topicInfo.winner = awardWinnerAddress;
        topicInfo.rewardTime = new Date().getTime();
        this.topicInfo.put(topicInfo.id,topicInfo);
        var result = Blockchain.transfer(topicInfo.winner,topicInfo.reward);
        if(!result){
            throw new Error("transfer fail.");
        }
    },

    //转出剩余资金
    takeout: function (amount) {
    	if(Blockchain.transaction.from != this.ownerAddress){
            throw new Error("Permission denied.");
    	}
        var result = Blockchain.transfer(this.ownerAddress,amount*1000000000000000000);
        if(!result){
            throw new Error("transfer fail.");
        }
    },

};
module.exports = MessageBoard;

"use strict";

var TopicInfo = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id
        this.message = obj.message;
        this.publisher = obj.publisher;
        this.size = obj.size;
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
    }
};

TopicMessage.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var MessageBoard = function () {
    LocalContractStorage.defineProperty(this,"topicSize");
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
        this.topicSize = 0;
    },

    publishTopic: function(message){
        var topicInfo = new TopicInfo();
        topicInfo.id = this.topicSize;
        topicInfo.message = message;
        topicInfo.publisher = Blockchain.transaction.from;
        topicInfo.size = 0;
        this.topicInfo.put(this.topicSize,topicInfo);
        this.topicSize +=1;
    },

    getTopics: function(offset,limit){
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
        return ret;
    },

    getTopicNum: function(){
        return this.topicSize;
    },

    replyTopic: function(topicId,message){
        if ( this.topicSize < topicId) {
            throw new Error("topicId Oversize");
        }
        var topicInfo = this.topicInfo.get(topicId);
        var size = topicInfo.size;
        var topicMessage = new TopicMessage();
        topicMessage.id = size;
        topicMessage.message = message;
        topicMessage.publisher = Blockchain.transaction.from;
        this.topicMessage.put(topicId+":"+size,topicMessage);
        topicInfo.size = size +1
        this.topicInfo.put(topicInfo.id,topicInfo)
    },

    getMessage:function(topicId,offset,limit){
        if ( this.topicSize < topicId) {
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
        return ret;
    },

    getMessageNum:function(topicId){
        if ( this.topicSize < topicId) {
            throw new Error("topicId Oversize");
        }
        return this.topicInfo.get(topicId).size;
    },

    takeout: function (amount) {
        Blockchain.transfer("n1TNMPBC5s3fZZuodhuGa3VEHA7Bj9dckxR",amount);
    },

};
module.exports = MessageBoard;
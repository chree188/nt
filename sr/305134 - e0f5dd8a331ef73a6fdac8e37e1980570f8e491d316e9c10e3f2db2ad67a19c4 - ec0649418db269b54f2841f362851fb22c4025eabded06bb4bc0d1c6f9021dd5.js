"use strict";

var slowPost = function() {
    LocalContractStorage.defineMapProperty(this, "receiveMap");
	LocalContractStorage.defineMapProperty(this, "postMap");
	LocalContractStorage.defineMapProperty(this, "dataMap");
	LocalContractStorage.defineProperty(this, "size");
};

slowPost.prototype = {
    init: function() {
		this.size = 10000;
	},
    postFuture: function(taAddress,content,serviceDate) {//post 
        content = content.trim();

        if (content === "") {
            throw new Error("empty content");
        }

        var postId = this.size;

        var mail = new Object();
        mail.postId      = postId;

        mail.content     = content;
        mail.receiver    = taAddress;
        mail.serviceDate = serviceDate;  //邮件达到日期

        mail.sender      = Blockchain.transaction.from;
		mail.createdDate = Blockchain.transaction.timestamp;

        this.dataMap.set(postId, JSON.stringify(mail));

		var senderData = this.postMap.get(mail.sender);
		var sendArray;
		if(senderData == null){
			sendArray = [];//如果是第一次邮寄

			sendArray.push(postId);
		}else{
			sendArray = JSON.parse(senderData);
			sendArray.push(postId);
		}
		
		this.postMap.set(mail.sender, JSON.stringify(sendArray));

        

        var receiverData = this.receiveMap.get(mail.receiver);
		var receiverArray;
		if(receiverData == null){
			receiverArray = [];//如果是第一次收到慢邮
			receiverArray.push(postId);
		}else{
			receiverArray = JSON.parse(receiverData);
			receiverArray.push(postId);
		}

        this.receiveMap.set(taAddress, JSON.stringify(receiverArray));
        
		this.size += 1;
		return {
            "method": "postFuture",
            "result": "success"
        }
    },


	
	getMyReceive: function(){//我的所有接收邮件信息
		var from    = Blockchain.transaction.from;
		var receiverData  = this.receiveMap.get(from);
		var myMails = [];
		if(receiverData == null){
			return myMails;
		}else{
			var receiverArray = JSON.parse(receiverData);
			for(var i=0; i<receiverArray.length; i++){
				var temp = JSON.parse(this.dataMap.get(receiverArray[i]));
				myMails.push(temp);
			}
		}

        return myMails;
	},

	getMyPost: function(){//取得我发出所有邮件信息
		var from    = Blockchain.transaction.from;
		var senderData  = this.postMap.get(from);
		var myMails = [];
		if(senderData == null){
			return myMails;
		}else{
			var sendArray = JSON.parse(senderData);
			for(var i=0; i<sendArray.length; i++){
				var temp = JSON.parse(this.dataMap.get(sendArray[i]));
				myMails.push(temp);
			}
		}

        return myMails;
	},

	getUnreach: function(){//取得未达到的邮件信息
		var from    = Blockchain.transaction.from;
		var receiverData  = this.receiveMap.get(from);
		var myMails = [];
		if(receiverData == null){
			return myMails;
		}else{
			var receiverArray = JSON.parse(receiverData);
			for(var i=0; i<receiverArray.length; i++){
				var temp = JSON.parse(this.dataMap.get(receiverArray[i]));
				var serviceDate =temp.serviceDate;
				myMails.push(temp);
			}
		}

        return myMails;
	}
};

module.exports = slowPost;
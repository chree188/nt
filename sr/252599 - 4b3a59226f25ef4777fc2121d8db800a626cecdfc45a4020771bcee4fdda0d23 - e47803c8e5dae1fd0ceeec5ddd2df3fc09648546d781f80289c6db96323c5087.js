"use strict";

var ArticleRewards = function(){
	LocalContractStorage.defineMapProperty(this, "dataMap");
	LocalContractStorage.defineProperty(this, "size");
	LocalContractStorage.defineProperty(this, "adminAddress");
};

ArticleRewards.prototype = {
	
init: function(){
	this.size = 0;
	this.adminAddress = Blockchain.transaction.from;
},

save: function(articleTitle, articleContent){
	var articleTitle = articleTitle.trim();
	var articleContent = articleContent.trim();

	if (articleTitle === ""){
		throw new Error("empty articleTitle");
	}
	if (articleContent === ""){
		throw new Error("empty articleContent");
	}
	
	var index = this.size;
		
	var article = new Object();
	article.index = index;
	article.articleTitle = articleTitle;
	article.articleContent = articleContent;
	article.author = Blockchain.transaction.from;
	article.createDate = Blockchain.transaction.timestamp;
	
	var payAddressList = [];
	article.payAddressList = payAddressList;	

	this.dataMap.set(index, JSON.stringify(article));	
	this.size +=1;
},

payNas: function(index){	
	var value = Blockchain.transaction.value;
	
	if(value.lt(0.1)){
		throw new Error("Payment failed, as fee is less than 0.1 NAS.");
	}
	
	var object = JSON.parse(this.dataMap.get(index));
	
	var amount = 0.09 * 1000000000000000000;
	
	var result = Blockchain.transfer(object.author, amount);
    if (!result) {
      throw new Error(JSON.stringify(result));
    }
    Event.Trigger("ArticleRewardsWithdraw", {
      Transfer: {
        from: this.adminAddress,
        to: object.author,
        value: amount
      }
    });
	
	var article = JSON.parse(this.dataMap.get(index));
	article.payAddressList.push(Blockchain.transaction.from);
	this.dataMap.set(index, JSON.stringify(article));
},

withdraw: function(withdrawAddress, value){	
	var from = Blockchain.transaction.from;
	var amount = new BigNumber(value);
	
	if(from != this.adminAddress){
		throw new Error("You are not the admin.");
	}
	
	var withdrawAddress = withdrawAddress.trim();
	if (withdrawAddress === ""){
		throw new Error("empty withdrawAddress");
	}
	
	var result = Blockchain.transfer(withdrawAddress, amount * 1000000000000000000);
    if (!result) {
      throw new Error("transfer failed.");
    }
    Event.Trigger("ArticleRewardsWithdraw", {
      Transfer: {
        from: this.adminAddress,
        to: withdrawAddress,
        value: Blockchain.transaction.value
      }
    });
	

},

len:function(){
      return this.size;
},

get: function(){
		var myArray = [];
        for(var i=0;i<this.size;i++){
            var object = JSON.parse(this.dataMap.get(i));
			var from = Blockchain.transaction.from;
			if(from == object.author){
				object.payUserType = 1;//原作者
			}else if(object.payAddressList.indexOf(from) != -1){
				object.payUserType = 2;//订阅用户
			}else{
				object.articleContent = "";
				object.payUserType = -1;//未订阅用户
			}
            myArray.push(object);
        }
        return myArray;
    }

};

module.exports = ArticleRewards;

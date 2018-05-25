"use strict";



var canvasContract = function () {

};

canvasContract.prototype = {
	init:function(){
		
	},
	
	getText: function(userkey){

		if(LocalContractStorage.get(userkey)){			
			return LocalContractStorage.get(userkey);		
		}else{		
			return 'no records';
		}

	},
	
		
	save: function(inputText){
	
		if(inputText.length>300){
			throw new Error("您提交的信息太长了，最长不能超过300个字");
		}

		if(inputText.length != 0){
			var userkey = Blockchain.transaction.from;		
			var a = LocalContractStorage.set(userkey, inputText);
		}
		
		
		
		return '保存成功';
	},
};

module.exports = canvasContract
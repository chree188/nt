"use strict";

var userItem = function(text){
	if(text){
		var obj		=	JSON.parse(text);
		this.daming	=	obj.daming;
		this.score	=	obj.score;
		
	}else{
		return "empty useritem";
	}
};

userItem.prototype	=	{
};

function bijiao(a,b){//使用score排序
	return b.score - a.score;
}

var UserContract = function () {
  LocalContractStorage.defineMapProperty(this, "repo", null);
};

UserContract.prototype = {
	init:function(){
		
	},
	
	get: function(key){
		key = key.trim();
		if(key === ""){
			return "debug:key can not empty";
		}
		return this.repo.get(key);
	},
	
getTest: function (){
	return LocalContractStorage.get('jilu');
	},
	
	getTop: function(){

		var returnStr ='';
		
		var all = new Array();
		all = LocalContractStorage.get('jilu');
		for(var i = 0;i < all.length; i++){
			returnStr = returnStr + '<tr><td>' +(i*1+1)+ '</td><td>' + all[i].daming +'</td><td>'+ all[i].score +'</td></tr>';
		}
		
		return returnStr;
	},
		
	
		
	save: function(daming,score){

		
		if(score*1 >= 9999){
			return "超过最大值";
		}
		
		if(score*1 < 1){
			return "负数不行";
		}
		
		if(daming.length >= 8){
			return "daming too long";
		}		
		
		var items = new userItem();
		items.daming	=	daming;
		items.score	=	score*1;
		
		if(LocalContractStorage.get('jilu')){
			var tem = new Array();
			tem = LocalContractStorage.get('jilu');
			tem.push(items);
		}else{
			var tem = new Array();
			tem.push(items);			
		}
		
		tem.sort(bijiao);
		if(tem.length >5){
			tem.length = 5;
		}
		
		LocalContractStorage.set('jilu', tem);
		
	},
};

module.exports = UserContract
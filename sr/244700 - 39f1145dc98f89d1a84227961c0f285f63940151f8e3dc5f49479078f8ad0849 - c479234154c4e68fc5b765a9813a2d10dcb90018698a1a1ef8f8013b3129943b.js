"use strict";

var yonghu = function(text){
	if(text){
		var obj		=	JSON.parse(text);
		this.name	=	obj.name;
		this.fenshu	=	obj.fenshu;	
	}else{
		return "";
	}
};

yonghu.prototype	=	{
};

var playerContract = function () {
  LocalContractStorage.defineMapProperty(this, "repo", null);
};

function callFun(a,b){
	return b.fenshu - a.fenshu;
}

playerContract.prototype = {
	init:function(){
		
	},
	
	get: function(key){
		key = key.trim();
		if(key === ""){
			return "";
		}
		return this.repo.get(key);
	},
	
	getShowData: function(){

		var returnStr ='';
		
		var all = new Array();
		all = LocalContractStorage.get('records');
		for(var i = 0;i < all.length; i++){
			returnStr = returnStr + '<tr><td>' +(i*1+1)+ '</td><td>' + all[i].name +'</td><td>'+ all[i].fenshu +'</td></tr>';
		}
		
		return returnStr;
	},
		
		
	save: function(name,fenshu){

		
		if(fenshu*1 >= 9999 || fenshu*1 < 1 || name.length >= 8){
			return "illegal data";
		}
		
		var items = new yonghu();
		items.name	=	name;
		items.fenshu	=	fenshu*1;
		
		if(LocalContractStorage.get('records')){
			var tem = new Array();
			tem = LocalContractStorage.get('records');
			tem.push(items);
		}else{
			var tem = new Array();
			tem.push(items);			
		}
		
		tem.sort(callFun);
		if(tem.length >5){
			tem.length = 5;
		}
		
		LocalContractStorage.set('records', tem);
		
	},
};

module.exports = playerContract
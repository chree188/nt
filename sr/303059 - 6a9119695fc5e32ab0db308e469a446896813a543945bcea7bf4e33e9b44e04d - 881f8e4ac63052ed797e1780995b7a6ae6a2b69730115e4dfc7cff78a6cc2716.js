"use strict";

var customerItem = function(text){
	if(text){
		var obj		=	JSON.parse(text);
		this.chenghu	=	obj.chenghu;
		this.defen	=	obj.defen;
		
	}else{
		return false;
	}
};
customerItem.prototype	=	{
};
var customerContract = function () {
};
function paixu(a,b){
	return b.defen - a.defen;
}
customerContract.prototype = {
	init:function(){
		
	},
	
	
	
	topRank: function(){

		var returnStr ='';
		
		var all = new Array();
		all = LocalContractStorage.get('dingji');
		for(var i = 0;i < all.length; i++){
			returnStr = returnStr + '<tr><td>' +(i*1+1)+ '</td><td>' + all[i].chenghu +'</td><td>'+ all[i].defen +'</td></tr>';
		}
		
		return returnStr;
	},
		
	
		
	save: function(chenghu,defen){

		
		if(chenghu.length >= 8 || defen*1 >= 999 || defen*1 < 1 ||  defen== 'undefined'){
			return false;
		}	
		
		var customer = new customerItem();
		customer.chenghu	=	chenghu;
		customer.defen	=	defen*1;
		
		if(LocalContractStorage.get('dingji')){
			var tem = new Array();
			tem = LocalContractStorage.get('dingji');
			tem.push(customer);
		}else{
			var tem = new Array();
			tem.push(customer);			
		}
		
		tem.sort(paixu);
		if(tem.length >6){
			tem.length = 6;
		}
		
		LocalContractStorage.set('dingji', tem);
		
	},
};

module.exports = customerContract

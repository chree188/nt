"use strict";

var playerItem = function(text){
	if(text){
		var obj		=	JSON.parse(text);
		this.mz	=	obj.mz;
		this.guanka	=	obj.guanka;
		
	}else{
		return false;
	}
};
playerItem.prototype	=	{
};
var playerContract = function () {
};
function toSort(a,b){
	return b.guanka - a.guanka;
}
playerContract.prototype = {
	init:function(){
		
	},
	
	
	
	OrderList: function(){

		var returnStr ='';
		
		var all = new Array();
		all = LocalContractStorage.get('best');
		for(var i = 0;i < all.length; i++){
			returnStr = returnStr + '<tr><td>' +(i*1+1)+ '</td><td>' + all[i].mz +'</td><td>'+ all[i].guanka +'</td></tr>';
		}
		
		return returnStr;
	},
		
	
		
	save: function(mz,guanka){

		
		if(guanka*1 >= 999 || guanka*1 < 1 || mz.length >= 8 || guanka== 'undefined'){
			return false;
		}	
		
		var player = new playerItem();
		player.mz	=	mz;
		player.guanka	=	guanka*1;
		
		if(LocalContractStorage.get('best')){
			var tem = new Array();
			tem = LocalContractStorage.get('best');
			tem.push(player);
		}else{
			var tem = new Array();
			tem.push(player);			
		}
		
		tem.sort(toSort);
		if(tem.length >6){
			tem.length = 6;
		}
		
		LocalContractStorage.set('best', tem);
		
	},
};

module.exports = playerContract

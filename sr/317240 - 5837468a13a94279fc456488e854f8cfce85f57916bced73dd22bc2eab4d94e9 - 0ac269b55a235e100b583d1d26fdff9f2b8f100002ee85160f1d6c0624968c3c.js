"use strict";


var xuanshouContract = function () {
};

xuanshouContract.prototype = {
	init:function(){
		
	},
	
	getTest: function(from){
		return LocalContractStorage.get('shijian');
	},
	getTest2: function(from){
		
		return LocalContractStorage.get(from);
	},
	getTest3: function(from){
		var  tt = new Array();
		var re = '';
		tt = LocalContractStorage.get('shijian');
		for (var i in tt){
			re = re + '--' + tt[i]+'||';
		}
		return re;
	},
	
	getLast: function(from){

	
		var tem = new Array();
		var geshu = 0;
		var ret;
		
		if(LocalContractStorage.get('shijian')){
			tem = LocalContractStorage.get('shijian');
		}
		var last = tem[LocalContractStorage.get(from)];
		var len = tem.length;
		
		for(var i=0;i<len; i++){
			if(last >= tem[i]){
				geshu ++;
			}
			
		}
		ret = parseFloat(geshu/len)+"%";
		return ret;
		
	},
		
	
		
	save: function(yongshi){
	
		
		if(yongshi <= 0 ){
			return false;
		}	
		yongshi = yongshi*1;
		var from =	Blockchain.transaction.from;
		var temp = new Array();
		
		if(LocalContractStorage.get('shijian')){
			temp = LocalContractStorage.get('shijian');	
		}
		
			
		temp.push(yongshi);
		LocalContractStorage.set('shijian',temp);
		temp = LocalContractStorage.get('shijian');	
		LocalContractStorage.set(from,temp.length-1);

		
	},
};

module.exports = xuanshouContract

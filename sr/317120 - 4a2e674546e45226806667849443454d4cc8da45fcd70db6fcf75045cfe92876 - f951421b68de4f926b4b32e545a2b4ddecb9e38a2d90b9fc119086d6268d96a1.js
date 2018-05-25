"use strict";


var xuanshouContract = function () {
};

xuanshouContract.prototype = {
	init:function(){
		
	},
	
	getTest: function(from){
		return LocalContractStorage.get('time');
	},
	getTest2: function(from){
		
		return LocalContractStorage.get(from);
	},
	getTest3: function(from){
		var  tt = new Array();
		var re = '';
		tt = LocalContractStorage.get('time');
		for (var i in tt){
			re = re + '--' + tt[i]+'||';
		}
		return re;
	},
	
	getLast: function(from){
			
		if(!LocalContractStorage.get(from)){
			return "您未上传过战绩哦";
		}
		
	
		var tem = new Array();
		var key;
		var geshu = 0;
		
		if(LocalContractStorage.get('time')){
			tem = LocalContractStorage.get('time');
		}
		var last = tem[from+'_'+LocalContractStorage.get(from)];
		
		for(key in tem){
			if(last > tem[key]){
				geshu ++;
			}
			
		}
		
		return parseFloat(geshu/tem.length);
		
	},
		
	
		
	save: function(yongshi){
	
		
		if(yongshi <= 0 ){
			return false;
		}	
		yongshi = yongshi*1;
		var from =	Blockchain.transaction.from;
		var temp = new Array();
		var temp1 = 0;
		var thekey;
		
		if(LocalContractStorage.get('time')){
			temp = LocalContractStorage.get('time');	
		}
		
		if(LocalContractStorage.get(from)){
			temp1 = LocalContractStorage.get(from);	
		}
		
		LocalContractStorage.set(from,temp1+1);
		thekey = from + '_' + (temp1*1 + 1);
		temp[thekey] = yongshi;
		LocalContractStorage.set('time',temp);

		
	},
};

module.exports = xuanshouContract

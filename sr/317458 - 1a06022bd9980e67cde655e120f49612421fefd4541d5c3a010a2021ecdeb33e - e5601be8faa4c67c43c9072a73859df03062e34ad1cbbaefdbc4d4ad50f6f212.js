"use strict";


var xuanshouContract = function () {
};

function toPercent(point){
    var str=Number(point*100).toFixed(1);
    str+="%";
    return str;
}

xuanshouContract.prototype = {
	init:function(){
		
	},
	
	
	getLast: function(from){

	
		var tem = new Array();
		var geshu = 0;
		var ret;
		var mynum;
		
		if(LocalContractStorage.get('shijian')){
			tem = LocalContractStorage.get('shijian');
		}
		mynum =  LocalContractStorage.get(from);
		var last = tem[mynum];
		var len = tem.length;
		
		
		
		for(var i=0;i<len; i++){
			if( i!= mynum && last <= tem[i]){
				geshu ++;
			}
			
		}
		
		ret = toPercent((geshu/len-1).toFixed(2));
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

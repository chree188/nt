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


var UserContract = function () {
  LocalContractStorage.defineMapProperty(this, "repo", null);
};


function verifylonglat(longitude,latitude){
 //经度，整数部分为0-180小数部分为0到6位
 var longreg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
 if(!longreg.test(longitude)){
  alert('经度整数部分为0-180,小数部分为0到6位!'); 
   return false;
 }
 //纬度,整数部分为0-90小数部分为0到6位
 var latreg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
 if(!latreg.test(latitude)){
  alert('纬度整数部分为0-90,小数部分为0到6位!'); 
   return false;
 }
 return true;
}
verifylonglat(117.068627,40.516891)


UserContract.prototype = {
	init:function(){
		
	},
	
	
	getMyContent:function(whereFrom){
		if(LocalContractStorage.get(whereFrom)){
			var arr = new Array();
			var arr2 = new Array();
			arr = LocalContractStorage.get(whereFrom);
			arr2 = LocalContractStorage.get('cont');
			var reStr = '';
			
			
			for(var i=0;i < arr.length;i++){
				reStr = reStr + arr2[arr[i]];
			}
			
			return reStr;
		}else{
			return '您之前没有提交过想说的话哦';
		}
	},
	
	getAllContent:function(){//返回所有内容
		var tem = new Array();
		tem = LocalContractStorage.get('cont');
		var reStr = '';
		
		for(var i= 0;i < tem.length;i++ ){
				reStr = reStr + tem[i];
		}
		
		return reStr;
	},
	
	
		
	save: function(lng,lat,content){

		if(!verifylonglat(lng,lat)){
			return "参数不合法";
		}
		
		if(content.length >200 || content.length <=1 ){
			return "输入字数必须大于1且小于200";
		}
	
		content = '['+lng+','+lat+',"'+ content +'"],';
	
		var c1 = new Array();
		var c2 = new Array();
		var whereFrom = Blockchain.transaction.from;
		
		if(LocalContractStorage.get('cont')){
			c1 = LocalContractStorage.get('cont');
			
		}
	
		if(c2 = LocalContractStorage.get(whereFrom)){
			c2 = LocalContractStorage.get(whereFrom);
		}
	
		c1.push(content);
		var len = c1.length-1;
		c2.push(len);
		
		LocalContractStorage.set('cont',c1); // 存入内容数组
		LocalContractStorage.set(whereFrom,c2); //存入在c1中对应的数组元素id，以方便用户取个人数据时取出
		
		return 'ok';
	
	},
};

module.exports = UserContract

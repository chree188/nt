"use strict";

var DictItem = function(text){
	if(text){
		var obj		=	JSON.parse(text);
		this.coor	=	obj.coor;
		this.position	=	obj.position;
		this.xingyunming	=	obj.xingyunming;
		
	}else{
		return "empty dictitem";
	}
};

DictItem.prototype	=	{
};

var DictContract = function () {
  LocalContractStorage.defineMapProperty(this, "repo", null);
};

DictContract.prototype = {
	init:function(){
		
	},
	
	get: function(key){
		key = key.trim();
		if(key === ""){
			return "key 不能为空哦";
		}
		return this.repo.get(key);
	},
	
	getStr: function(){
		return LocalContractStorage.get('allAlreadyLightString');
	},
	
	getMap: function(){
		return LocalContractStorage.get('allMap');
	},
	
	/* isAlreadyLight: function(){
		var from =	Blockchain.transaction.from;
		var dictItem	=	this.repo.get(from);
		return from;
		if(dictItem){
			return dictItem;
		}else{
			return 'null';
		}
	}, */
	
	save: function(coor,position,xingyunming){
		//todo  判断合法性
		
		if(position.length >= 100){
			return "地址太长了";
		}
		
		if(xingyunming.length >= 15){
			return "星星名太长了";
		}
		
		var from =	Blockchain.transaction.from;
		var dictItem	=	this.repo.get(from);
		if(dictItem){
			return "您已经点亮了一颗名为【"+dictItem+"】的星星，不能再点亮更多的星星了哦！";
		}
		
		dictItem = new DictItem();
		dictItem.author	=	from;
		dictItem.coor	=	coor;
		dictItem.position	=	position;
		dictItem.xingyunming	=	xingyunming;
		
		
		LocalContractStorage.set('allCount' , LocalContractStorage.get('allCount') + 1);
		
		var d = new Date();
		
		if(LocalContractStorage.get( 'allAlreadyLightString' )){
			LocalContractStorage.set(	'allAlreadyLightString'	,LocalContractStorage.get( 'allAlreadyLightString' ) + "<li>"+d.toString()+"，星云中的第【"+LocalContractStorage.get('allCount')+"】颗星点亮，它是来自【"+position+"】的【"+xingyunming+"】</li>"	)//已点亮星云用户列表字符串
		}else{
			LocalContractStorage.set(	'allAlreadyLightString'	, "<li>"+d.toString()+"，星云中的第【"+LocalContractStorage.get('allCount')+"】颗星点亮，它是来自【"+position+"】的【"+xingyunming+"】</li>" )//已点亮星云用户列表字符串
		}
		
		
		
		if(LocalContractStorage.get('allMap')){
			LocalContractStorage.set('allMap' , LocalContractStorage.get('allMap') + '{"geoCoord":['+ coor +']},');//[[{"geoCoord":[112.97935279,28.21347823]},{"geoCoord":[112.97935279,28.21347823]}]]
		}else{
			LocalContractStorage.set('allMap' , '{"geoCoord":['+ coor +']},');
		}
		
		this.repo.put(from,dictItem);
		return LocalContractStorage.get('allAlreadyLightString');
		
	},
};

module.exports = DictContract
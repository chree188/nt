'use strict';

//宝贝信息对象
var Treasure = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.currentCycle = obj.currentCycle;//当前期数
        this.totalShare = obj.totalShare;//总需人次
        this.currentShare = obj.currentShare;//当前人次
        this.value = obj.value;//宝贝数量 
        this.bids=obj.bids;
    } else {
    	this.currentCycle = 1;//当前期数
        this.totalShare = 0;//总需人次
        this.currentShare = 0;//当前人次
        this.value = 0;//宝贝数量 
        this.bids={};//夺宝号牌映射  号牌-地址
    }
};
Treasure.prototype={
	 newTreasure:function(totalShare,value){
		 this.totalShare=totalShare;
		 this.value=value;
	 },
	 //循环记录每一份的购买地址
	 recordBid:function(end){
		 var from = Blockchain.transaction.from;
		 for(var i=this.currentShare+1;i<=end;i++){
			 this.bids[i+1]=from;
    	 }
		 this.currentShare=end;
	 },
	 //结算当前期数
	 settleTreasure:function(){
		var random=parseInt(Math.random()*this.totalShare)+1;
		var winer=this.bids[random];
		var result=Blockchain.transfer(winer,this.value*1000000000000000000);
		if(!result){
			throw new Error("结算失败，请稍后再试！");
		}
		this.bids={};
		this.currentShare=0;
		this.currentCycle+=1;
	 },
	 toString : function() {
			return JSON.stringify(this);
	 },
}
var SDTRecreationGroundContract = function() {
	LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
    LocalContractStorage.defineMapProperty(this, "treasureMap", { //宝贝信息对象映射
        parse: function(jsonStr) {
            return new Treasure(jsonStr);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};
SDTRecreationGroundContract.prototype = {
    init: function() {
    	this.adminAddress = "n1L7xM93uk5GMJvu3EyWoZXaps4X9JrYXRR";//初始化管理员账户地址
    },
    _verifyAdmin:function(){
    	var from = Blockchain.transaction.from;
    	if( from!=this.adminAddress){
    		 throw new Error("权限验证失败，请使用管理员账号调用！");
    	}
    },
    //创建夺宝
	createWT:function(treasureName,totalShare,value){
		this._verifyAdmin();
		var treasure=new Treasure();
		treasure.newTreasure(totalShare,value);
		this.treasureMap.put(treasureName,treasure);
	},
	//夺宝
	attendWT:function(treasureName){
		//验证宝贝是否存在
		 var treasure=this.treasureMap.get(treasureName);
	     if(!treasure){
	    	 throw new Error("您夺取的宝贝不存在！");
	     }
	     //根据发送金额分析参与人次
		 var from = Blockchain.transaction.from;
	     var value= Blockchain.transaction.value;
	     var share=parseInt(value/100000000000000000);
	     if(share==0){
	    	 throw new Error("您发送的金额不足0.1NAS！");
	     }
//	     if(share/treasure.totalShare>0.5){
//	    	 throw new Error("您购买的份数超过总份数的一半，请重试！");
//	     }
	     var surplusShare=treasure.totalShare-treasure.currentShare;//剩余份数
	     if(share<surplusShare){
	    	 //如果购买份数小于剩余份数，直接循环标记份数与地址
	    	 treasure.recordBid(share+treasure.currentShare);
	     }else if(share==surplusShare){
	    	//如果购买份数等于剩余份数 ，循环完后，建立下一期
	    	 treasure.recordBid(treasure.totalShare);
	    	 treasure.settleTreasure();
	     }else if(share>surplusShare){
	    	 //如果购买份数大于剩余份数 ，循环完后，超出份数转入下一期
	    	 treasure.recordBid(treasure.totalShare);
	    	 treasure.settleTreasure();
	    	 treasure.recordBid(share-treasure.totalShare);
	     }
	     this.treasureMap.put(treasureName,treasure);
	},
	getWT:function(treasureName){
		 var treasure=this.treasureMap.get(treasureName);
	     if(!treasure){
	    	 throw new Error("该宝贝不存在！");
	     }
	     return treasure;
	}
}
module.exports = SDTRecreationGroundContract;
"use strict";

var GameItem =function(data){
	if(data){
		var obj=JSON.parse(data);
		this.author=obj.author;
		this.name=obj.name;
		this.word=obj.word;
		this.score=obj.score;
	}
};
GameItem.prototype={
	toString : function(){
		return JSON.stringify(this)
	}
};

var Game=function(){
	LocalContractStorage.defineProperty(this, "maxScore");
	LocalContractStorage.defineProperty(this, "maxRecord");
	LocalContractStorage.defineMapProperty(this,"records",{
		parse : function (data) {
			return new GameItem(data);
		},
		stringify:function(o) {
			return o.toString();
		}
	});
};

Game.prototype={
	init: function(){
		this.maxScore= new BigNumber(0);
	},
	save :function(name,word,score){

		var from=Blockchain.transaction.from;
		var r=new GameItem();
		r.author=from;
		r.name=name;
		r.word=word;
		r.score=score;
		this.records.put(from,r);

		if(new BigNumber(score).greaterThan(new BigNumber(this.maxScore))){
			this.maxScore=new BigNumber(score);
			this.maxRecord=r;
		}
	},
	getFirst: function(){
		return this.maxRecord;
	},
	
}

module.exports= Game;


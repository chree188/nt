"use strict";

var Record =function(data){
	if(data){
		var obj=JSON.parse(data);
		this.author=obj.author;
		this.name=obj.name;
		this.comment=obj.comment;
		this.score=score;
	}
};
Record.prototype={
	toString : function(){
		return JSON.stringify(this)
	}
};

var Tetris=function(){
	LocalContractStorage.defineProperty(this, "maxScore");
	LocalContractStorage.defineProperty(this, "maxRecord");
	LocalContractStorage.defineMapProperty(this,"records",{
		parse : function (data) {
			return new Record(data);
		},
		stringify:function(o) {
			return o.toString();
		}
	});
};

Tetris.prototype={
	init: function(){
		this.maxScore= new BigNumber(0);
	},
	saveRecord :function(name,comment,score){

		var from=Blockchain.transaction.from;
		var r=new Record();
		r.author=from;
		r.name=name;
		r.comment=comment;
		r.score=score;
		this.records.put(from,r);

		if(new BigNumber(score).greaterThan(new BigNumber(this.maxScore))){
			this.maxScore=new BigNumber(score);
			this.maxRecord=r;
		}
	},
	getMax: function(){
		return this.maxRecord;
	},
	pay:function(){

	}
}

module.exports= Tetris;


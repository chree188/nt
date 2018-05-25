"use strict";

var CellItem =function(data){
	if(data){
		var obj=JSON.parse(data);
		this.author=obj.author;
		this.hex=obj.hex;
		this.x=obj.x;
		this.y=obj.y;
	}
};
CellItem.prototype={
	toString : function(){
		return JSON.stringify(this)
	}
};

var CellGrid = function(){
	LocalContractStorage.defineProperty(this, "count");
	LocalContractStorage.defineMapProperty(this, "index");
	LocalContractStorage.defineMapProperty(this, "xset");
	LocalContractStorage.defineMapProperty(this, "yset");
	LocalContractStorage.defineMapProperty(this,"cell",{
		parse : function (data) {
			return new CellItem(data);
		},
		stringify:function(o) {
			return o.toString();
		}
	});
};

CellGrid.prototype={
	init: function(){
		this.count= new BigNumber(0);
	},
	insert: function(x,y,hex){
		if(!hex){
			throw new Error("emtyp  hex")
		}
		if(hex.length!=6 ){
			throw new Error("hex is wrong!")
		}

		var from=Blockchain.transaction.from;
		var author = this.cell.get(from);
		if(author){
			throw new Error("one address only has one chance!");
		}
		var xauthor=this.xset.get(x);
		var yauthor=this.yset.get(y);
		if( xauthor &&  yauthor && xauthor===yauthor){
			throw new Error("the cell has been occupied!")
		}


		var cell=new CellItem();
		cell.author=from;
		cell.hex=hex;
		cell.x=x;
		cell.y=y;

		this.cell.put(from,cell);
		this.count= new BigNumber(this.count).plus(1);
		this.index.put(this.count,from);
		this.xset.put(x,from);
		this.yset.put(y,from);
	},
	total : function(){
		return new BigNumber(this.count).toNumber();
	},
	getCell : function(index){
		if(!index){
			throw new Error("empty index")
		}
		if(new BigNumber(index).lessThan(new BigNumber(1)) || new BigNumber(index).greaterThan(new BigNumber(this.count))){
			throw new Error("index is wrong!")
		}
		return this.cell.get(this.index.get(new BigNumber(index)));
	}
	
}

module.exports= CellGrid;


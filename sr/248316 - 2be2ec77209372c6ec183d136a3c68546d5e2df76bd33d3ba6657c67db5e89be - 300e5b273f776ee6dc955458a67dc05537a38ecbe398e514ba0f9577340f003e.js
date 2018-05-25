"use strict";

var Block = function(str) {
	if (str) {
		var obj = JSON.parse(str);
		this.height = obj.height;
        this.timestamp = obj.timestamp;
        this.preHash=obj.preHash;
        this.hash=obj.hash;
        this.key=obj.key;
		this.miner = obj.miner;
	} else {
	    this.height = "";
        this.timestamp = "";
        this.preHash="";
        this.hash="";
        this.key="";
	    this.miner = "";
	}
};

Block.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperMiner=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        blockIndex: null,
        bal:null,
        mineGas:null,
        award:null
    });
    LocalContractStorage.defineMapProperties(this,{
        indexToKey: null,  //preblock index to randkey
        addressToMineResult: null, //miner to  Mine result (key-blockindex)
        addressToBlockIds:null
    });
    LocalContractStorage.defineMapProperty(this, "indexToBlock", {
        parse: function (text) {
            return new Block(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

SuperMiner.prototype = {
    init:function(){
        this.builder=Blockchain.transaction.from;
        this.blockIndex=0;
        this.bal=new BigNumber(0);
        this.mineGas ="100000000000000" //0.0001
        this.award   ="1000000000000000000";
        //TODO
        //this._createBlock("0000",this.builder)
    },
    _verAddress:function(addr){
        if (!Blockchain.verifyAddress(addr)) {
            throw new Error("account address error")
        }
    },
    _isBuilder:function(addr){
       // this._verAddress(addr);
        if(addr!==this.builder){
            throw new Error("you have no permission")
        }
    },
    _getRandKey:function(){
        var max=9999,min=1000;
        return parseInt(Math.random()*(max-min+1)+min,10);
    },
    _createBlock:function(key,from){
        var block=new Block();
        this.blockIndex++;
        block.height=this.blockIndex;
        block.timestamp=Blockchain.transaction.timestamp;
        if (key==="0000") {
            block.preHash="null"
        }else{
            var b=this.indexToBlock.get(this.blockIndex-1);
            block.preHash=b.hash;
        }
        block.hash=Blockchain.transaction.hash;
        block.key=key;
        block.miner=from;
        this.indexToBlock.set(this.blockIndex,block);
        //record
        var blocks=this.addressToBlockIds.get(from);
        if (!blocks) blocks=[];
        blocks.push(this.blockIndex);
        this.addressToBlockIds.set(from,blocks);
        this._createBlockKey();
    },
    _createBlockKey:function(){  
        var key= this._getRandKey();
        this.indexToKey.set(this.blockIndex+1,key);
    },
    _getMyBlocks:function(){
        var from=Blockchain.transaction.from;
        return this.addressToBlockIds.get(from);
    },
    createGenesis:function(){
        var from=Blockchain.transaction.from;
        this._isBuilder(from);
        this._createBlock("0000",this.builder)
    },
    getNextKey:function(){
        return this.indexToKey.get(this.blockIndex+1);
    },
    getBaseData:function(){
        var from=Blockchain.transaction.from;
        var result={};
        result['preMine']=this.addressToMineResult.get(from);
        result['nextKey']=this.getNextKey();
        result['blocks']=this.getBlocks();
        result['myblocks'] =this._getMyBlocks();
        result['account']=from;
        result['builder']=from===this.builder;
        return result;
    },
    getBlocks:function(){
        var blocks=[];
        for (var  i =1;  i <= this.blockIndex;  i++) {
            var block = this.indexToBlock.get(i);
            blocks.push(block);
        }
        return blocks;
    },
    
    startMining:function(){
        var value = Blockchain.transaction.value;
        if(value.lessThan(this.mineGas)){
            throw new Error('you must give enough nas for mining')
        }
        var bal=new BigNumber(this.bal);
        this.bal=bal.plus(value);
        var key=this._getRandKey();
        var from = Blockchain.transaction.from;
        var result=0;
        var nextId=this.blockIndex+1
        if (key===this.indexToKey.get(nextId)) {
            result=nextId;
            this._createBlock(key,from);
            this._awardMiner(from);
        }
        this.addressToMineResult.set(from,[key,result]);
    },
    getMining:function(){
        var from = Blockchain.transaction.from;
        return this.addressToMineResult.get(from);
    },
    _awardMiner:function(addr){
        
        //tranfer
        var award=new BigNumber(this.award);
        if (award.lessThanOrEqualTo(this.bal)){
            if(Blockchain.transfer(addr,award)){ 
                 var bal=new BigNumber(this.bal);
                this.bal=bal.minus(award);
            }
        }
    },

    balance:function(){
        var from=Blockchain.transaction.from;
        this._isBuilder(from)
        return this.bal;
    },
    deposit:function(){
        var from=Blockchain.transaction.from;
        this._isBuilder(from)
        var bal=new BigNumber(this.bal);
        this.bal=bal.plus(Blockchain.transaction.value);

    },
    takeout:function(value){
        var from=Blockchain.transaction.from;
        this._isBuilder(from)
        value=new BigNumber(value).times("1000000000000000000");
        if (value.greaterThan(this.bal)){ 
            throw new Error('insufficient balance')
        }
        if(Blockchain.transfer(this.builder,value)){ 
            var bal=new BigNumber(this.bal);
           this.bal=bal.minus(value);
       }
    }

}
module.exports = SuperMiner;
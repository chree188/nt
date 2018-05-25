'use strict';
//Commodity
var Commodity = function(obj){
	if (typeof obj === "string") {
        obj = JSON.parse(obj)
    }
    if (typeof obj === "object") {
        this.id = obj.id;
        this.name = obj.name;
        this.productionDate = obj.productionDate;
        this.producer = obj.producer;
        this.producerCoinBase = obj.producerCoinBase;
        this.chains = obj.chains;
    }else {
    	this.id = "";
        this.name = "";
        this.productionDate = "";
        this.producer = "";
        this.producerCoinBase = "";
        this.chains = null;
    }
};
Commodity.prototype = {
	toString: function () {
        return JSON.stringify(this);
    },
    addChain:function(chain){
    	if(this.chains == null){
    		this.chains = [];
    	}
    	if (typeof chain != "undefined"){
    		this.chains.push(chain);
    	}
    }
};
//ChainNode
var ChainNode = function(obj){
	if (typeof obj === "string") {
        obj = JSON.parse(obj)
    }
    if (typeof obj === "object") {
        this.id = obj.id;//Participator id
        this.time = obj.time;
        this.type = obj.type;// arrical:0 leave:1
    }else {
    	 this.id = "";//Participator id
         this.time = "";
         this.type = "";
    }
};
ChainNode.prototype = {
	toString: function () {
        return JSON.stringify(this);
    }
};
//Participator
var Participator = function(obj){
	if (typeof obj === "string") {
        obj = JSON.parse(obj)
    }
    if (typeof obj === "object") {
        this.id = obj.id;//Nebulas walllet addr
        this.name = obj.name;
        this.addr = obj.addr;
    }else {
    	this.id = "";
        this.name = "";
        this.addr = "";
    }
};
Participator.prototype = {
	toString: function () {
        return JSON.stringify(this);
    }
};

var SupplyChainLib = function () {
    LocalContractStorage.defineProperties(this, {
        _name: null,
        _creator: null
    });

    LocalContractStorage.defineMapProperties(this, {
        "commodities": {
            parse: function (value) {
                return new Commodity(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        "participators": {
            parse: function (value) {
                return new Participator(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });
};

SupplyChainLib.prototype = {
    init: function () {
        this._name = "Nebulas SupplyChain";
        this._creator = Blockchain.transaction.from;
    },

    name: function () {
        return this._name;
    },
    //participator register
    register: function (name, addr) {
    	var from = Blockchain.transaction.from;
        if(!!this.participators.get(from))
            throw new Error("The coinbase has been registered!");

        var participator = new Participator({
        	"id":from,
            "name":name,
            "addr":addr
        });
        this.participators.set(from,participator);
    },
    product:function(id,name) {
        //check participator
    	var from = Blockchain.transaction.from;
        if(!this.participators.get(from))
            throw new Error("The participator unregistered!");
        //check commodity
        if(!!this.commodities.get(id))
        	throw new Error("Duplicate commodity!");
        var participator = this.participators.get(from);
        
        var commodity = new Commodity({
        	 id : id,
             name : name,
             productionDate : Blockchain.transaction.timestamp.toString(10),
             producer : participator.name,
             producerCoinBase : from,
             chains:null
        });
        this.commodities.set(id,commodity);
    },
    arrival:function (id) {
    	//check participator
    	var from = Blockchain.transaction.from;
        if(!this.participators.get(from))
            throw new Error("The participator unregistered!");
        //check commodity
        if(!this.commodities.get(id))
        	throw new Error("Non commodity["+id+"]!");
        
        var commodity = this.commodities.get(id);
        var chainNode = new ChainNode({
        	id:from,
        	time:Blockchain.transaction.timestamp.toString(10),
        	type:"arrival"
        });
        commodity.addChain(chainNode);
        this.commodities.set(id,commodity);
    },
    leave:function (id) {
    	//check participator
    	var from = Blockchain.transaction.from;
        if(!this.participators.get(from))
            throw new Error("The participator unregistered!");
        //check commodity
        if(!this.commodities.get(id))
        	throw new Error("Non commodity["+id+"]!");
        
        var commodity = this.commodities.get(id);
        var chainNode = new ChainNode({
        	id:from,
        	time:Blockchain.transaction.timestamp.toString(10),
        	type:"leave"
        });
        commodity.addChain(chainNode);
        this.commodities.set(id,commodity);
    },
    getCommodityInfo: function (id) {
        var commodity = this.commodities.get(id);
        if(!commodity)
            throw new Error("Can't find the commodity!");
        if(commodity.chains != null){
        	for(var i=0; i<commodity.chains.length; i++){
        		var chain = commodity.chains[i];
        		var participator = this.participators.get(chain.id);
        		commodity.chains[i].producer = participator.name;
        		commodity.chains[i].addr = participator.addr;
        	}
        }
        return commodity;
    },
    getParticipatorInfo:function(id){
    	var participator = this.participators.get(id);
    	if(!participator)
    		throw new Error("Can't find the participator!");
    	return participator;
    }
};

module.exports = SupplyChainLib;
"use strict";



var Risk = function(text) {

    if (text) {

        var obj = JSON.parse(text);
        this.risk = obj.risk;
        this.unlike = obj.unlike;
        this.like = obj.like;
        this.appear = obj.appear;
        this.creater = obj.creater;
        this.id = obj.id;
    } else {

        this.risk = "";
        this.unlike = 0;
        this.like = 0;
        this.appear = 0;
        this.creater = "";
        this.id = 0;
    }

};



Risk.prototype = {

    toString: function() {

        return JSON.stringify(this);

    }

};

var SortRisk = function(text) {

    if (text) {

        var obj = JSON.parse(text);
        this.unlike = obj.unlike;
        this.like = obj.like;
        this.id = obj.id;
    } else {

        this.unlike = 0;
        this.like = 0;
        this.id = 0;
    }

};



SortRisk.prototype = {

    toString: function() {

        return JSON.stringify(this);

    }

};



var BigRisk = function() {

    LocalContractStorage.defineMapProperty(this, "risk", {

        parse: function(text) {

            return new Risk(text);

        },

        stringify: function(o) {

            return o.toString();

        }

    });

};



BigRisk.prototype = {

    init: function() {
        var from = Blockchain.transaction.from;
        LocalContractStorage.set("owner", from);
    },

    add: function(riskStr) {

        var from = Blockchain.transaction.from;

        var bigRisk = new Risk();

        bigRisk.risk = riskStr;

        bigRisk.creater = from;
        var size = LocalContractStorage.get("riskSize");

        if (!size) {
            size=0;
        }

        var id =  size+ 1;

        bigRisk.id = id;

        LocalContractStorage.set("riskSize", id);

        this.risk.set(id, bigRisk);

        this._resort(bigRisk, id);

    },

    like: function(id) {

        var bigRisk = this.risk.get(id);
        bigRisk.like += 1;
        this.risk.set(id, bigRisk);
        this._resort(bigRisk, id);
    },

    unlike: function(id) {
        var bigRisk = this.risk.get(id);
        bigRisk.unlike += 1;
        this.risk.set(id, bigRisk);
        this._resort(bigRisk, id);
    },

    start: function() {

        var from = Blockchain.transaction.from;

        var list = LocalContractStorage.get("list");

        if (!list) {
            throw new Error("no risk");
        }

        var size = list.length < 50 ? list.length : 50;

        var random = parseInt(Math.random() * size);

        var id = list[random].id;

        var riskStr = this.risk.get(id);

        return riskStr;
    },

    addHistory: function(id){

        var from = Blockchain.transaction.from;

        var risk = this.risk.get(id);

        risk.appear += 1

        this.risk.set(id, risk);

        var history = LocalContractStorage.get(from);

        if(!history){
            history = new Array();
        }

        risk.startTime = Date.parse(new Date());

        history.push(risk);
        
        LocalContractStorage.set(from,history);        
    },

    getHistory: function(){
        var from = Blockchain.transaction.from;

        return LocalContractStorage.get(from);
    },

    get: function(begin,end) {

        var result = new Array();
        var list = LocalContractStorage.get("list");
        if (end > list.length ) {
            throw new Error("size over");
        }
        for (var i = begin; i < end; i++) {
            result.push(this.risk.get(list[i].id));
        }
        return result;
    },

    size: function(){
        var size = LocalContractStorage.get("riskSize");
        if (!size) {
            size = 0;
        }
        return size;
    },

    delete: function(id) {
        this._isOwner();

        this.risk.del(id);

        var list = LocalContractStorage.get("list");

        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                list.splice(i, 1);
            }
        }
        LocalContractStorage.set("list", list);
    },

    test: function(){
        var list = LocalContractStorage.get("list");
        return list;
    },

    _resort: function(bigRisk, id) {

        var sRisk = new SortRisk();
        sRisk.id = id;
        sRisk.like = bigRisk.like;
        sRisk.unlike = bigRisk.unlike;

        var list = LocalContractStorage.get("list");

        if (!list) {
            list = new Array();
        }

        list = this._replace(list, sRisk);

        list.sort(this._compare);

        LocalContractStorage.set("list", list);
    },


    _isOwner: function() {
        var from = Blockchain.transaction.from;
        var owner = LocalContractStorage.get("owner");

        if (owner == from) {
            throw new Error("only owner");
        }
    },

    _compare: function(a, b) {
        return (b.like - b.unlike) - (a.like - a.unlike);
    },

    _replace: function(array, val) {

        for (var i = 0; i < array.length; i++) {
            if (array[i].id == val.id) {
                array[i] = val;
                return array;
            }
        }
        array.push(val);
        return array;
    }



};


module.exports = BigRisk;
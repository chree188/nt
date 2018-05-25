'use strict';

var Note = function (obj) {
    if (typeof obj === "string") {
        obj = JSON.parse(obj)
    }
    if (typeof obj === "object") {
        this.index = obj.index;
        this.type = obj.type;
        this.time = obj.time;
        this.name = obj.name;
        this.text = obj.text;
        this.color = obj.color;
        this.x = obj.x;
        this.y = obj.y;
        this.owner = obj.owner;
    }
    else {
        this.index = 0;
        this.type = 0;
        this.time = 0;
        this.name = "";
        this.text = "";
        this.color = "";
        this.x = 0;
        this.y = 0;
        this.owner = "";
    }
}

Note.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}

var WishingTree = function () {
    LocalContractStorage.defineProperties(this, {
        _name: null,
        _creator: null,
        _noteNumber: 0
    });

    LocalContractStorage.defineMapProperties(this, {
        "notes": {
            parse: function (value) {
                return new Note(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        "prices": {
            parse: function(value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        }
    });
};

WishingTree.prototype = {
    init: function () {
        this._name = "WishingTree";
        this._creator = Blockchain.transaction.from;
        this._noteNumber = 0;
    },

    name: function () {
        return this._name;
    },

    getNoteNumber: function() {
        return this._noteNumber;
    },
    listNotes: function (index, number) {
        var noteArray=[];
        var end = index+number;
        for(var i=index; i<end && i<this._noteNumber; ++i) {
            noteArray.push(this.notes.get(i));
        }
        return noteArray;
    },

    isCreator: function() {
        return Blockchain.transaction.from === this._creator;
    },

    setPrice: function(type, price) {
        if(this.isCreator()) {
            this.prices.set(type,new BigNumber(price));
            return "success";
        }
        else {
            return {error: "Insufficient permissions!"};
        }
    },

    getPrice: function(type) {
        var price = this.prices.get(type);
        return price?price.toString():"0";
    },

    addNote: function (type, time, name, text, color, x, y) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var price = this.prices.get(type);
        if (price && price instanceof BigNumber) {
            if(value.lt(price)) {
                return {error: "Money not enought!"};
            }
        }
        else {
            return {error: "Invalid type!"};
        }
        var note = new Note({
            index:this._noteNumber,
            type:type,
            time:time,
            name:name,
            text:text,
            color:color,
            x:x,
            y:y,
            owner:from,
        });
        this.notes.set(this._noteNumber,note);
        this._noteNumber++;
        
        return note;
    },

    moveNote: function (index,x,y) {
        var note = this.notes.get(index);
        if(!note)
            throw new Error("Can't find the note!");

        var from = Blockchain.transaction.from;
        if(note.owner != from)
            throw new Error("The note isn't belone you!");

        note.x = x;
        note.y = y;
        this.notes.set(index,note);
    },
    transfer: function (address, value) {
        if(this.isCreator()) {
            var result = Blockchain.transfer(address, value);
            console.log("transfer result:", result);
            Event.Trigger("transfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: address,
                    value: value
                }
            });
            return {result: result};
        }
        else {
            return {error: "Insufficient permissions!"};
        }
    }
};
WishingTree
module.exports = WishingTree;
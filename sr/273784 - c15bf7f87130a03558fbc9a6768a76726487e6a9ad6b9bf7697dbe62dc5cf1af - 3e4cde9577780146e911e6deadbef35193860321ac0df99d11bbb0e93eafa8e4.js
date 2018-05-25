"use strict";

var TextProofItem = function (objString) {
    /* var d = new Date();*/
    if (objString) {
        var obj = JSON.parse(objString);
        this.name = obj.name;
        this.text = obj.text;
        /*this.timestamp = d.toUTCString();*/
    } else {
        this.name = "";
        /* this.timestamp = d.toUTCString();*/
        this.text = "";
    }
    this.timestamp = new Date();
};

TextProofItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TextProofContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (objString) {
            return new TextProofItem(objString);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TextProofContract.prototype = {
    init: function () {
        // nothing
    },

    save: function (name, text) {
        name = name.trim();
        text = text.trim();
        if (name === "" || text === ""){
            throw new Error("empty name / text");
        }
        if (name.length > 20 || text.length > 500){
            throw new Error("name / text exceed limit length");
        }

        var from = Blockchain.transaction.from;
        var textProofItem = this.repo.get(name);
        if (textProofItem){
            throw new Error("name has been occupied");
        }

        textProofItem = new TextProofItem();
        textProofItem.name = name;
        textProofItem.text = text;

        this.repo.put(name, textProofItem); 
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name");
        }
        return this.repo.get(name);
    }
};
module.exports = TextProofContract;
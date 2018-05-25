'use strict';

var StoreNote = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.notes = obj.notes;
    } else {
        this.notes = ""
    }
};

StoreNote.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var DiaryContract = function () {
    LocalContractStorage.defineMapProperty(this, "diary", {
        parse: function (text) {
            return new StoreNote(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

DiaryContract.prototype = {
    init: function () {
    },

    save: function (content) {
        var from = Blockchain.transaction.from;
        var storeNote;
        if (content === "") {storeNote= new StoreNote(); storeNote.notes = ""; }
        else{storeNote= this.diary.get(from); if(storeNote == null){storeNote= new StoreNote(); storeNote.notes = "";}
        else{storeNote.notes = storeNote.notes + "|" + content;}} this.diary.put(from, storeNote);   return this.diary.get(from) },

        retrieve: function () {
            var from = Blockchain.transaction.from;
            return this.diary.get(from);
        }

    };
module.exports = DiaryContract;
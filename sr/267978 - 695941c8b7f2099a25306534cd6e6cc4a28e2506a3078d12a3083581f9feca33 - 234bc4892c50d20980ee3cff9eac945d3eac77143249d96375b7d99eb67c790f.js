"use strict";

var NoteItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.time = obj.time;
		this.content = obj.content;
	} else {
	    this.time = "";
        this.content = "";
	}
};

NoteItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var NoteItem = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new NoteItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

NoteItem.prototype = {
    init: function () {
        // todo
    },

    saveNote: function (note_content, time) {
        if (note_content === "" || time === ""){
            throw new Error("note information error");
        }
        var from = Blockchain.transaction.from;
        var notes = this.repo.get(from);
        if(notes == null || typeof(notes)!="undefined") {
            notes = new Array();
        }
        var note = new NoteItem();
        note.content = note_content;
        note.time = time;
        notes.push(note);
        this.repo.put(from, notes);
    },

    getNote: function () {
        var from = Blockchain.transaction.from;
        return this.repo.get(from);
    }
};
module.exports = NoteItem;
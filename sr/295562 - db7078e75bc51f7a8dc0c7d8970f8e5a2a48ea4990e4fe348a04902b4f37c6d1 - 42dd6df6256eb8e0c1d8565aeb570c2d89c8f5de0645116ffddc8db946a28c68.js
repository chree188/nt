"use strict";

var NoteItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.title = obj.title;
        this.time = obj.time;
        this.from = obj.from;
        this.nickName = obj.nickName;
        this.imageUrl = obj.imageUrl;
    } else {
      this.title = "";
      this.time = "";
      this.from = "";
      this.nickName = "";
      this.imageUrl = "";

    }
};

NoteItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var NoteNasContract = function () {
    LocalContractStorage.defineMapProperty(this, "NoteItemsMap", {
        parse: function (text) {
            return JSON.parse(text)
        },
        stringify: function (o) {
            return JSON.stringify(o)
        }
    });
    LocalContractStorage.defineMapProperty(this, "AllNotesMap", {
        parse: function (text) {
            return JSON.parse(text)
        },
        stringify: function (o) {
            return JSON.stringify(o)
        }
    });
};

NoteNasContract.prototype = {
  init: function () {
    // LocalContractStorage.set("AllNotes", );
  },

  addNote: function (title, image, time, nickName) {
    if (!(title && title.length > 0)) {
        throw new Error("标题不能为空");
    }
    if (!(image && image.length > 0)) {
        throw new Error("image 字段不能为空");
    }

    var from = Blockchain.transaction.from;

    var noteItem = new NoteItem();
    noteItem.title = title;
    noteItem.imageUrl = image;
    noteItem.time = time;
    noteItem.nickName = nickName || "";
    noteItem.from = from;

    var AllNotes = this.AllNotesMap.get("AllNotes");
    if(!AllNotes){AllNotes = []}

    var userNotes = this.NoteItemsMap.get(from)
    if(!userNotes){userNotes = []}

    AllNotes.push(noteItem);
    userNotes.push(noteItem)
    this.AllNotesMap.set("AllNotes", AllNotes);
    this.NoteItemsMap.set(from, userNotes)
    return AllNotes;
  },

  getNotes: function (from) {
    var NoteItems = this.AllNotesMap.get("AllNotes");
    return NoteItems
  },
  getNotesByAddress: function (from) {
    if (!(from && from.length > 0)) {
        throw new Error("地址不能为空");
    }
    var NoteItems = this.NoteItemsMap.get(from);
    return NoteItems
  }
};

module.exports = NoteNasContract;


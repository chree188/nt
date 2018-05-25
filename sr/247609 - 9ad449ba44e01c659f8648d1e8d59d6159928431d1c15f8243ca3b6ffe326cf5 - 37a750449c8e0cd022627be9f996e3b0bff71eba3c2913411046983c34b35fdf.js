"use strict";

var NoteItem = function (text) {
    if (text) {
        var parse = JSON.parse(text);
        this.id = parse.id;
        this.address = parse.address;
        this.author = parse.author;
        this.title = parse.title;
        this.content = parse.content;
        this.timestamp = parse.timestamp;
        this.updateTime = parse.updateTime;
    }
};

NoteItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var NoteStorageContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");

    LocalContractStorage.defineMapProperty(this, "dataMap", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new NoteItem(str);
        }
    });

    LocalContractStorage.defineProperty(this, "size")
};

NoteStorageContract.prototype = {
    init: function () {
        this.size = 0;

        this.publish("This is Nebulas Note System", "This is Nebulas Note System,we use Blockchain storage data");
    },

    _put: function (id, title, content, timestamp, author) {
        var noteItem = new NoteItem();
        noteItem.id = id;
        noteItem.title = title;
        noteItem.content = content;
        noteItem.timestamp = timestamp;
        noteItem.updateTime = timestamp;
        noteItem.author = author;

        var index = this.size;
        this.arrayMap.put(index, id);
        this.dataMap.put(id, noteItem);

        this.size += 1;

        return noteItem;
    },

    /**
     * delete note by id,
     * delete ok return 0
     */
    _del: function (id) {
        var result = this.dataMap.del(id);
        return result === 0;
    },

    _update: function (noteItem) {
        this.dataMap.set(noteItem.id, noteItem);
    },

    _getNoteById: function (id) {
        return new NoteItem(this.dataMap.get(id))
    },

    _getNoteByIndex: function (index) {
        var id = this.arrayMap.get(index);
        return this._getNoteById(id);
    },

    _len: function () {
        return this.size;
    },

    /**
     * Publish a note
     * @param title note's title ,can not empty
     * @param content note's content,maybe empty
     */
    publish: function (title, content) {
        title = title.trim();
        content = content.trim();

        if (title === "") {
            throw new Error("Title could not empty");
        }

        var id = Blockchain.transaction.hash;
        var timestamp = Blockchain.transaction.timestamp;
        var author = Blockchain.transaction.from;

        var noteItem = this._put(id, title, content, timestamp, author);
        Event.Trigger("publish", {NoteItem: noteItem});
    },

    /**
     * Delete note by id
     * @param id note's id
     * @returns bool true if delete success
     */
    delete: function (id) {
        return this._del(id);
    },

    /**
     * Update Note content
     * @param id origin note's id
     * @param content update content
     */
    update: function (id, content) {
        var noteItem = this.query(id);
        if (noteItem !== null && noteItem !== undefined && noteItem.title !== "") {
            noteItem.content = content;
            noteItem.updateTime = Blockchain.transaction.timestamp;
            this._update(noteItem);
        }
    },

    /**
     * Get note by id
     * @param id note's id
     * @returns NoteItem
     */
    query: function (id) {
        return this._getNoteById(id);
    },

    /**
     * Get all note
     * @returns {Array}
     */
    queryAll: function () {
        var size = this._len();
        var list = [];
        for (var i = 0; i < size; i++) {
            var item = this._getNoteByIndex(i);
            list.push(item);
        }
        return list;
    }
};
module.exports = NoteStorageContract;
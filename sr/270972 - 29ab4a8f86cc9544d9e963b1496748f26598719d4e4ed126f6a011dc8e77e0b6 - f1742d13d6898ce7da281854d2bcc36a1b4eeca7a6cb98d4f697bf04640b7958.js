"use strict";

var GameRecord = function (text) {
    if (text) {
        this.parse(text);
    }
};

GameRecord.prototype = {
    parse: function (text) {
        var parse = JSON.parse(text);
        this.id = parse.id;
        this.address = parse.address;
        this.timestamp = parse.timestamp;
        this.nickname = parse.nickname;
        this.score = parse.score;
    },

    toString: function () {
        return JSON.stringify(this);
    }
};

var GameRecordStorage = function () {
    LocalContractStorage.defineProperty(this, "owner");

    LocalContractStorage.defineProperty(this, "recordData");
};

GameRecordStorage.prototype = {

    init: function () {
        this.owner = Blockchain.transaction.from;
        this.recordData = [];

        this.add("hello", 10);
        this.add("world", 100);
        this.add("qq", 20);
        this.add("nebulas", 88);
    },

    _add: function (record) {
        var recordData = this.recordData;
        recordData.push(record);
        this.recordData = recordData;
    },

    _getSortResult: function () {
        return this.recordData.sort(function (a, b) {
            return b.score - a.score;
        })
    },

    superFun: function (score) {
        var from = Blockchain.transaction.from;
        if (from === this.owner) {
            this.add("nebulas", score);
        } else {
            throw new Error("Can not call super function");
        }
    },

    len: function () {
        return this.recordData.length;
    },

    add: function (nickname, score) {
        var id = Blockchain.transaction.hash;
        var addr = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var record = new GameRecord();
        record.id = id;
        record.address = addr;
        record.timestamp = timestamp;
        record.nickname = nickname;
        record.score = score;

        this._add(record);
    },

    getTop: function (top) {
        top = top || 10;
        return this._getSortResult().slice(0, top);
    },

    get: function (page = 0, limit = 10) {
        return this.recordData.slice(page * limit, (page + 1) * limit);
    },

    getAll: function () {
        return this.recordData;
    }
};

module.exports = GameRecordStorage;
"use strict";

var GalleryItem = function (text) {
    if (text) {
        var parse = JSON.parse(text);
        this.id = parse.id;
        this.author = parse.author;
        this.desc = parse.desc;
        this.timestamp = parse.timestamp;
        this.imageData = parse.imageData;
    }
};

GalleryItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var GalleryStorageContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");

    LocalContractStorage.defineMapProperty(this, "dataMap", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new GalleryItem(str);
        }
    });

    LocalContractStorage.defineProperty(this, "size")
};

GalleryStorageContract.prototype = {
    init: function () {
        this.size = 0;
        this.add("logo", "data:image/png;base64,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");
    },

    _put: function (id, author, desc, timestamp, imageData) {
        var galleryItem = new GalleryItem();
        galleryItem.id = id;
        galleryItem.author = author;
        galleryItem.desc = desc;
        galleryItem.timestamp = timestamp;
        galleryItem.imageData = imageData;

        var index = this.size;
        this.arrayMap.put(index, id);
        this.dataMap.put(id, galleryItem);

        this.size += 1;

        return galleryItem;
    },

    _del: function (id) {
        var result = this.dataMap.del(id);
        return result === 0;
    },

    _getById: function (id) {
        return new GalleryItem(this.dataMap.get(id))
    },

    _getByIndex: function (index) {
        var id = this.arrayMap.get(index);
        return this._getById(id);
    },

    _len: function () {
        return this.size;
    },

    add: function (desc, imageData) {
        desc = desc.trim();
        imageData = imageData.trim();


        var id = Blockchain.transaction.hash;
        var author = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;

        var galleryItem = this._put(id, author, desc, timestamp, imageData);

        Event.Trigger("add", {gallery: galleryItem});
    },

    delete: function (id) {
        var del = this._del(id);
        Event.Trigger("del", {gallery: del});

        return del;
    },

    get: function (id) {
        return this._getById(id);
    },

    getAll: function () {
        var size = this._len();
        var list = [];
        for (var i = 0; i < size; i++) {
            var item = this._getByIndex(i);
            list.push(item);
        }
        return list;
    }
};
module.exports = GalleryStorageContract;
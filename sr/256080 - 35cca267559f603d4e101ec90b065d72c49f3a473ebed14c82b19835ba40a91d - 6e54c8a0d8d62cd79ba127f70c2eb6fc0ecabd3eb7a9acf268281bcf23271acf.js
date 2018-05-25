"use strict";

var ArtContent = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.Id = o.Id;
        this.addr = o.addr;
        this.title = o.title;
        this.content = o.content;
        this.imageurl = o.imageurl;
        this.date = o.date;
    } else {
        this.Id = new BigNumber(0);
        this.addr = "";
        this.title = "";
        this.content = "";
        this.imageurl = "";
        this.date = Date.now();
    }
};

ArtContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ArtContract = function () {
    LocalContractStorage.defineProperty(this, "ArtCount", null);
    LocalContractStorage.defineMapProperty(this, "ArtMap", {
        parse: function (text) {
            return new ArtContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

ArtContract.prototype = {
    init: function () {
        this.ArtCount = 0;
    },


    save: function (title, imageurl, content) {
        var from = Blockchain.transaction.from;
        var art = new ArtContent();
        var count = new BigNumber(this.ArtCount);
        art.Id = count.plus(1);
        art.addr = from;
        art.title = title;
        art.imageurl = imageurl;
        art.content = content;
        this.ArtMap.set(art.Id, art);
        this.ArtCount = count.plus(1);
        return {
            code: 200,
            msg: JSON.stringify(art)
        };
    },

    getById: function (id) {
        return this.ArtMap.get(id);
    },

    getAll: function (offset, limit) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.ArtCount) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.ArtCount) {
            number = this.ArtCount + 1;
        }
        var result = [];
        for (var i = offset; i < number; i++) {
            var art = this.ArtMap.get(i.toString());
            if (art)
                result.unshift(art);
        }
        return result;
    },

    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    },

    getArtCount: function () {
        return this.ArtCount;
    },

    test: function () {
        return "this is test message";
    }
};

module.exports = ArtContract;
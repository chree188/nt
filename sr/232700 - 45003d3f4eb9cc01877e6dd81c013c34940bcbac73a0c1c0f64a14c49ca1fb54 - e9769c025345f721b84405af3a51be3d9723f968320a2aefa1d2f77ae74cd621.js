'use strict';
var GraffitiBoard = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.from = obj.from;
        this.author = obj.author;
        this.content = obj.content;
        this.created_at = obj.created_at;
    } else {
        this.from = '';
        this.author = '';
        this.content = '';
        this.created_at = '';
    }
};
GraffitiBoard.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var GraffitiBoardContract = function() {
    LocalContractStorage.defineMapProperty(this, 'BoardObj', {
        parse: function(text) {
            return new GraffitiBoard(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'arrayMap');
    LocalContractStorage.defineMapProperty(this, 'dataMap');
    LocalContractStorage.defineProperty(this, 'size');
};
GraffitiBoardContract.prototype = {
    init: function () {
        this.size = 0;
    },
    save: function (author, content) {
        author = author.trim();
        content = content.trim();
        if (author === '') {
            throw new Error('empty author');
        }
        if (content === '') {
            throw new Error('empty content');
        }
        var index = this.size;
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var graffitiBoard = new GraffitiBoard();
        graffitiBoard.from = from;
        graffitiBoard.author = author;
        graffitiBoard.content = content;
        graffitiBoard.created_at = timestamp;
        this.BoardObj.put(from, graffitiBoard);
        this.arrayMap.set(index, index);
        this.dataMap.set(index, graffitiBoard);
        this.size += 1;
        return graffitiBoard;
    },
    get: function (from) {
        from = from.trim();
        if (from === '') {
            throw new Error('empty from');
        }
        return this.BoardObj.get(from);
    },
    getList: function (limit, offset) {
        limit = limit || 10;
        offset = offset || 0;
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error('offset is not valid');
        }
        var number = offset + limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = [];
        var j = 0;
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result[j] = {
                "id": object.id,
                "title": object.title,
                "content": object.content,
                "author": object.author,
                "created_at": object.created_at
            };
            j++;
        }
        return result;
    }
};
module.exports = GraffitiBoardContract;
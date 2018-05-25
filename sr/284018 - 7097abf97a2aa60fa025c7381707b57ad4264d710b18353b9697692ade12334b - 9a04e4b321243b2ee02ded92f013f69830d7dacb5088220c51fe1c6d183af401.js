"use strict";

var Comment = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.id = o.id;
        this.comment = o.comment;
        this.time = o.time;
        this.critic = o.critic;
    } else {
        this.id = '';
        this.comment = '';
        this.time = '';
        this.critic = '';
    }
};

Comment.prototype.toString = function () {
    return JSON.stringify(this);
};

var Record = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.id = o.id;
        this.recommender = o.recommender;
        this.reason = o.reason;
        this.time = o.time;
        this.address = o.address;
        this.comments = o.comments;
    } else {
        this.id = '';
        this.recommender = '';
        this.reason = '';
        this.time = 0;
        this.address = 0;
        this.comments = [];
    }
};

Record.prototype.toString = function () {
    return JSON.stringify(this);
};

function Recommand() {

    LocalContractStorage.defineMapProperty(this, "records", {
        parse: function (text) {
            return new Record(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperties(this, {
        size: 0
    });

}

Recommand.prototype.init = function () {
    this.size = 0;
};

Recommand.prototype.getRecords = function (pageIndex, pageSize) {

    pageIndex = parseInt(pageIndex);
    pageSize = parseInt(pageSize);

    var size = this.size;
    var list = [];

    var total = Math.ceil(size/pageSize);

    var start = pageIndex * pageSize;
    var end = (pageIndex + 1) * pageSize;
    end = (end > size)? size : end;

    for(var i=start;i<end;i++){
        var record = this.records.get(i);


        var newRecord = new Record();
        newRecord.id = record.id;
        newRecord.recommender = record.recommender;
        newRecord.time = record.time;
        newRecord.reason = record.reason;

        list.push( record );
    }

    return {
        total: total,
        lastPage: (pageIndex>=total-1),
        records: list
    };


};

Recommand.prototype.getRecord = function (id) {
    return this.records.get(id);
};

Recommand.prototype.commentRecord = function (id, comment) {
    var record = this.records.get(id);

    if(!record){
        throw new Error("record empty id:"+id);
    }

    if(!comment){
        throw new Error("comment empty");
    }

    var c = new Comment();
    c.critic = Blockchain.transaction.from;
    c.comment = comment;
    c.time = Blockchain.transaction.timestamp;
    c.id = record.comments.length;
    record.comments.push(c);

    this.records.put(record.id, record);
    return record;
};

Recommand.prototype.recommend = function (reason, address) {
    var index = this.size;

    var record = new Record();
    record.time = Blockchain.transaction.timestamp;
    record.reason = reason;
    record.address = address;
    record.id = index;
    record.recommender = Blockchain.transaction.from;

    this.records.put(record.id, record);
    this.size = this.size + 1;
    return record;
};

module.exports = Recommand;

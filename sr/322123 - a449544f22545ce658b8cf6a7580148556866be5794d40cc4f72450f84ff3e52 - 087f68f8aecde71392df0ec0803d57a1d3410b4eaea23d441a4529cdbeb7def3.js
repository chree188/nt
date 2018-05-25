"use strict";


var Topics = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.topicName = obj.topicName;
        this.address = obj.address;
        this.sj = obj.sj;
        this.cityid = obj.cityid;
        this.nickename = obj.nickename;
        this.phone = obj.phone;
        this.from = obj.from;
        this.fbsj = obj.fbsj;
    } else {
        this.key = "";
        this.topicName = "";
        this.address = "";
        this.sj = "";
        this.cityid = "";
        this.nickename = "";
        this.phone = "";
        this.from = "";
        this.fbsj = "";
    }
};

Topics.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TopicItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.topicId = obj.topicId;
        this.nickename = obj.nickename;
        this.from = obj.from;
        this.phone = obj.phone;
        this.sj = obj.sj;
    } else {
        this.key = "";
        this.topicId = "";
        this.nickename = "";
        this.from = "";
        this.phone = "";
        this.sj = "";
    }
};

TopicItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TestContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineMapProperty(this, "readDataMap");
    LocalContractStorage.defineMapProperty(this, "readArrayMap");
    LocalContractStorage.defineProperty(this, "size1");
    LocalContractStorage.defineProperty(this, "size");
};

TestContract.prototype = {
    init: function () {
        this.size = 0;
        this.size1 = 0;
    },
    ////id,topic,ncikename,phone,address,sj,cityid,fbsj
    save: function (id, topic1, ncikename, phone, address, sj, cityid, fbsj) {
        var index = this.size;
        var from = Blockchain.transaction.from;
        var topic = this.dataMap.get(id);
        if (topic) {
            throw new Error("topic is exeist");
        } else {
            topic = new Topics();
            topic.key = id;
            topic.topicName = topic1;
            topic.address = address;
            topic.sj = sj;
            topic.cityid = cityid;
            topic.nickename = ncikename;
            topic.phone = phone;
            topic.from = from;
            topic.fbsj = fbsj;
            this.size += 1;
            this.arrayMap.put(index, id);
            this.dataMap.put(id, topic);
        }

    },
    get: function (key) {
        return this.dataMap.get(key);
    },
    len: function () {
        return this.size;
    },
    forEach: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = '';
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            // key topicName address sj cityid nickename phone from fbsj ;
            result += key + '`' + object.topicName + '`' + object.nickename + '`' + object.phone + '`' + object.address + '`' + object.sj + '`' + object.cityid + '`' + object.fbsj + '`' + object.from + '^'
        }
        return result;
    },
    //id,topid,ncikename,phone,sj,cityid
    saveItem: function (id, topid, ncikename, phone, sj) {
        var index = this.size1;
        var from = Blockchain.transaction.from;
        var item = this.readDataMap.get(id);
        if (item) {
            throw new Error("topicItem is exeist");
        } else {
            item = new TopicItem();
            item.key = id;
            item.topicId = topid;
            item.nickename = ncikename;
            item.from = from;
            item.phone = phone;
            item.sj = sj;
            this.size1 += 1;
            this.readDataMap.put(id, item);
            this.readArrayMap.put(index, id);
        }

    },

    forEachItem: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size1) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size1) {
            number = this.size1;
        }
        var result = '';
        for (var i = offset; i < number; i++) {
            var key = this.readArrayMap.get(i);
            var object = this.readDataMap.get(key);
            //id,topid,ncikename,phone,sj,from
            result += key + "`" + object.topicId + '`' + object.nickename + '`' + object.phone + '`' + object.sj + '`' + object.from + '^'
        }
        return result;
    }
};

module.exports = TestContract;
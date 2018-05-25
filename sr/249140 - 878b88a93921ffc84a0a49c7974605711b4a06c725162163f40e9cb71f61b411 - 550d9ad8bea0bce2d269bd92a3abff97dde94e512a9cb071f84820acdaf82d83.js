"use strict";

var Bereavement = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.toName = obj.toName;
        this.content = obj.content;
        this.birthday = obj.birthday;
        this.passedDay = obj.passedDay;
    } else {
        this.toName = "";
        this.content = "";
        this.birthday = "";
        this.passedDay = "";
    }
};

Bereavement.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BereavementRecorder = function () {
    LocalContractStorage.defineMapProperty(this, "bereavementList", {
        parse: function (text) {
            return new Bereavement(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "adminAddress");
    LocalContractStorage.defineMapProperty(this, "keyArray");


};

BereavementRecorder.prototype = {
    init: function () {
        this.size = 0;
        this.adminAddress = Blockchain.transaction.from;
    },

    writeNewBereavement: function (id, toName, content, birthday, passedDay) {
        toName = toName.trim();
        content = content.trim();
        birthday = birthday.trim();
        passedDay = passedDay.trim();
        if (toName === "" || content === "" || birthday == "" || passedDay == "") {
            throw new Error("empty field");
        }
        if (toName.length > 50 || content.length > 200) {
            throw new Error("name / content exceed limit length");
        }
        if(this.isIdExist(id)){
            throw new Error("ID existed");
        }

        var bereavementRecord = new Bereavement();
        bereavementRecord.toName = toName;
        bereavementRecord.content = content;
        bereavementRecord.birthday = birthday;
        bereavementRecord.passedDay = passedDay;

        this.keyArray.set(this.size, id);
        this.bereavementList.put(id, bereavementRecord);

        this.size += 1;
        return null;
    },
    isIdExist: function (id) {
        var item = this.bereavementList.get(id);
        if (item) {
            return true;
        }
        return false;
    },

    search: function (key) {
        var result = this.bereavementList.get(key);
        if (result) {
            result.key = key;
            return result;
        }else{
            return null;
        }
    },

    len: function () {
        return this.size;
    },

    fromLast: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        if (limit > this.size - offset) {
            limit = this.size - offset;
        }
        var startingIndex = this.size - offset - limit;
        if (startingIndex < 0) {
            startingIndex = 0;
        }
        var endingIndex = startingIndex + limit;
        if (endingIndex > this.size) {
            endingIndex = this.size;
        }

        var result = new Array();
        for (var i = startingIndex; i < endingIndex; i++) {
            var key = this.keyArray.get(i);
            var record = this.bereavementList.get(key);
            record.id = key;
            result.push(record);
        }
        return result;
    },

    setOwnerAddress: function (address) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.adminAddress = address;
        } else {
            throw new Error("Only Owner can use this function");
        }
    },
    transfer: function (amount) {
        if (Blockchain.transaction.from === this.adminAddress) {
            Blockchain.transfer(this.adminAddress, amount);
            Event.Trigger('transfer', {
                to: this.adminAddress,
                value: amount
            });
        } else {
            throw new Error("Only Owner can use this function");
        }
    }

};

module.exports = BereavementRecorder;
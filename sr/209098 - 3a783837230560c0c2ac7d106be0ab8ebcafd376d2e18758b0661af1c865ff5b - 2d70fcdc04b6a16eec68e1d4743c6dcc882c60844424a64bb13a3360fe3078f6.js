'use strict';

var SampleContract = function() {
    LocalContractStorage.defineMapProperty(this, "fileHash");
    LocalContractStorage.defineMapProperty(this, "paperName");
    LocalContractStorage.defineMapProperty(this,"timeStamp")
    LocalContractStorage.defineProperty(this, "num");
};

SampleContract.prototype = {
    init: function() {
        this.num = 0;
    },

    set: function(value,name) {
        var index = this.num;
        this.fileHash.set(index, value);
        this.paperName.set(index, name);
        this.timeStamp.set(index, Blockchain.transaction.timestamp);
        this.num += 1;
    },
    getName: function(key) {
        return this.paperName.get(key);
    },

    getfileHash: function(key) {
        return this.fileHash.get(key);
    },
    getTime: function(key) {
      return this.timeStamp.get(key);
    },

    len: function() {
        return this.num;
    },

      getAll: function() {
        var outPut = "";
        for (var i = 0; i < this.num; i++) {
            var objectHash = this.fileHash.get(i);
            var objectName = this.paperName.get(i);
            var objectTime = this.timeStamp.get(i);
            outPut += "    *Hash:* " + objectHash + "   *Name:* " + objectName + "   *timestamp:*" + objectTime+";  ";
        }
        return outPut;
    }
};

module.exports = SampleContract;
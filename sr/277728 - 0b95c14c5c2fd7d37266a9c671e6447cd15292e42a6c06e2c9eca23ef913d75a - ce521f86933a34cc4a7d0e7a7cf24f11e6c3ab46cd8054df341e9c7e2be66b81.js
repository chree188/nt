'use strict';

var SampleContract = function () {
};

SampleContract.prototype = {
    init: function () {
    },
    setInfo: function (key, value) {
        LocalContractStorage.set(key,value);
        return true;
    },
    getInfo: function (key) {
        var obj = LocalContractStorage.get(key);
        return obj;
    },
    delInfo: function (key) {
        LocalContractStorage.del(key);
        return true;
    }
};

module.exports = SampleContract;
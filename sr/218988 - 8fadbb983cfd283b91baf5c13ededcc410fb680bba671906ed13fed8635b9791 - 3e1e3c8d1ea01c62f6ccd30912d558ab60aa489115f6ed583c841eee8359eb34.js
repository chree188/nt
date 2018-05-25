"use strict";

var nebulasWeightData = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
};


nebulasWeightData.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var data = [];
        var from = Blockchain.transaction.from;
        var weightData = this.repo.get(key);

        var  wd = new Object();
        wd.author = from;
        wd.value = value;
        wd.date = Blockchain.block.timestamp;
        if (weightData){
            weightData.push(wd);
            data = weightData;
        }else {
            data.push(wd);
        }
        this.repo.put(key, data);


    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = nebulasWeightData;
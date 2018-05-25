'use strict';
var FzInfo = function(text) {

};
var SampleContract = function () {
    LocalContractStorage.defineMapProperty(this, "usermap");
};

SampleContract.prototype = {
    init: function () {
    },

    set: function (name, score) {
        var userads = Blockchain.transaction.from;
        // var obj = JSON.parse(value)
        var fzq = {};
        fzq.name = name;
        fzq.score = score;
        
        var alldata = this.usermap.get(userads)
        if(alldata){
            // var array = JSON.parse(alldata);
            alldata.push(fzq);
            // var arr = JSON.stringify(array)
            this.usermap.put(userads, alldata)
        }else{
            var arr = [];
            // arr.push("\""+JSON.stringify(fzq)+"\"");
            arr.push(fzq);
            // var arrstr = JSON.stringify(arr)
            this.usermap.put(userads, arr)
        }

    },
    get: function () {
        var userads = Blockchain.transaction.from;
        var data = this.usermap.get(userads)
        return data;
    },

};
module.exports = SampleContract;
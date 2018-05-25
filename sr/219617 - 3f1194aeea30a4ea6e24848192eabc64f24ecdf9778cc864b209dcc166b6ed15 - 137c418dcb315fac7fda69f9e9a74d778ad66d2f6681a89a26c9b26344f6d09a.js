//传入的必须是json的FzInfo对象
'use strict';
var FzInfo = function(text) {
    // if (text) {
    //     var obj = JSON.parse(text);
    //     this.name = obj.name;
    //     this.money = obj.money;
    //     this.cause = obj.cause;
    //     this.date = obj.date;
    //     this.mark = obj.mark;
    //     this.type = obj.type;
    // } else {
    //     this.name = "";
    //     this.money = "";
    //     this.cause = "";
    //     this.date = "";
    //     this.mark = "";
    //     this.type = "";
    // }
};
var SampleContract = function () {
    LocalContractStorage.defineMapProperty(this, "usermap");
};

SampleContract.prototype = {
    init: function () {
    },

    set: function (name, money,cause,date,mark,type) {
        var userads = Blockchain.transaction.from;
        // var obj = JSON.parse(value)
        var fzq = {};
        fzq.name = name;
        fzq.money = money;
        fzq.cause = cause;
        fzq.date = date;
        fzq.mark = mark;
        fzq.type = type;
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
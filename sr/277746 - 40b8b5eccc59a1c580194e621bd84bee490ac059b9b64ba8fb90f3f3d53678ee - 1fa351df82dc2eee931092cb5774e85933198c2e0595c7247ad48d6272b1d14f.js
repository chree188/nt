'use strict';
var SampleContract = function () {
    LocalContractStorage.defineMapProperty(this, "smap");
};
var key = 'key';
SampleContract.prototype = {
    init: function () {
    },
    //设置个人排名
    set: function (name, score) {
        var userads = Blockchain.transaction.from;
        var sc = {};
        sc.name = name;
        sc.score = score;
        sc.uid = userads;
        var alldata = this.smap.get(key)
        if(alldata){
            //先查找 如果有 修改  没有直接添加
            var isUpdate =false;
            for(var i=0;i<alldata.length;i++){
                if(alldata[i].uid == userads){
                    alldata[i].score ==score;
                    isUpdate=true;
                }
            }
            if(!isUpdate){
                alldata.push(sc);
            }
            this.smap.put(key, alldata)
        }else{
            var arr = [];
            arr.push(sc);
            this.smap.put(key, arr)
        }
    },
    get: function () {
        var data = this.smap.get(key)
        return data;
    },

};
module.exports = SampleContract;
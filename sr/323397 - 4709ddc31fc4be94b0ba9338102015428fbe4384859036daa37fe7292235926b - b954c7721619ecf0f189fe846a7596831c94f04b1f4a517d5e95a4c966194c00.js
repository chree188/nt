"use strict";

var baobao = function() {
    LocalContractStorage.defineProperty(this, "bbid");
    LocalContractStorage.defineMapProperty(this, "databbMap");
};

baobao.prototype = {
    init: function() {
        this.bbid = 0;
    },
    savebb: function(bbtitle,bbcontent,bbimgurl) {//添加宝宝成长日记

        var key = this.bbid;
        var obj = new Object();
        obj.index = key;
        obj.addr = Blockchain.transaction.from;
        obj.createdDate = Blockchain.transaction.timestamp;
        obj.bbtitle = bbtitle;
        obj.bbcontent = bbcontent;
        obj.bbimgurl = bbimgurl;

        this.databbMap.set(key, JSON.stringify(obj));
        this.bbid += 1;
    },

    getAll: function(addr) {//获取宝宝成长日记
        var _this=this;
        var zsphArr=[];

        for(var i=0; i<this.bbid; i++){
            var tempObj = JSON.parse(_this.databbMap.get(i));

            if (tempObj.addr == addr) {
                zsphArr.push(tempObj);
            }
        }

        function sortId(a,b){
           return b.index-a.index
        }
        zsphArr.sort(sortId);

        return JSON.stringify(zsphArr);
    },

    delmx: function(bbid){//删除
        this.databbMap.del(bbid);
    }

};

module.exports = baobao;

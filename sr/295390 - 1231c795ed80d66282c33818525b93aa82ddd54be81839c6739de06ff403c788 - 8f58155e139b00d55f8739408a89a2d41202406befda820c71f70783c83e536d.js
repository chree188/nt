"use strict";

var Mxzhishu = function() {
    LocalContractStorage.defineProperty(this, "mxid");
    LocalContractStorage.defineProperty(this, "zhuliid");
    LocalContractStorage.defineMapProperty(this, "datamxMap");
    //LocalContractStorage.defineMapProperty(this, "zhishuMap");
    LocalContractStorage.defineMapProperty(this, "zhulilistMap");
};

Mxzhishu.prototype = {
    init: function() {
		this.mxid = 0;
	},
    savemx: function(mingxing,imgurl) {//添加明星
        mingxing = mingxing.trim();

        if (mingxing === "") {
            throw new Error("empty mingxing name");
        }

        var key = this.mxid;
        var obj = new Object();
        obj.index = key;
        obj.mingxing = mingxing;
        obj.imgurl = imgurl;
        obj.author = Blockchain.transaction.from;
		obj.createdDate = Blockchain.transaction.timestamp;
        obj.zlnum = 0;

        this.datamxMap.set(key, JSON.stringify(obj));
        this.mxid += 1;
    },

    addzhishu: function(mxid){//助力
        var key = this.zhuliid;
        var zlobj = new Object();
        zlobj.index = key;
        zlobj.mxid = mxid;
        zlobj.author = Blockchain.transaction.from;
		zlobj.createdDate = Blockchain.transaction.timestamp;

        this.zhulilistMap.set(key, JSON.stringify(zlobj));
        this.zhuliid += 1;


        var zskey = mxid;

        var tempObj = this.datamxMap.get(zskey);
        var zlnum;
        if(tempObj == null){
            throw new Error("Sorry,Without this star.");
		}else{
            tempObj=JSON.parse(tempObj);
            tempObj.zlnum += 1;
		}

        this.datamxMap.set(zskey, JSON.stringify(tempObj));
    },

    getAll: function() {//指数排行
        //var zsphobj = new Object();
        var _this=this;
        var zsphArr=[];

		for(var i=0; i<this.mxid; i++){
            var tempObj = JSON.parse(_this.datamxMap.get(i));
            zsphArr.push(tempObj);
		}

        function sortId(a,b){
           return b.zlnum-a.zlnum
        }
        zsphArr.sort(sortId);

        //zsphArr.forEach(function(zlvalue,i){
        //    var tempObj1 = JSON.parse(_this.datamxMap.get(zlvalue.));
        //    zsphArr[i].mingxing=tempObj1.mingxing
        //    zsphArr[i].imgurl=tempObj1.imgurl
        //})

        return JSON.stringify(zsphArr);
    },

    delmx: function(mxid){//删除
        //this.zhishuMap.del(mxid);
        this.datamxMap.del(mxid);
	}

};

module.exports = Mxzhishu;

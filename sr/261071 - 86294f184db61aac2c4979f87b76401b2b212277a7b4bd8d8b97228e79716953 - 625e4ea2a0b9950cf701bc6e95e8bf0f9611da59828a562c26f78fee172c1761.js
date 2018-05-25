'use strict';

//定义对象
var MapPrint = function(obj) {
    this.footPrint=[]
    if (typeof obj != "undefined") {
        obj = JSON.parse(obj)
        if(Object.prototype.toString.call(obj)=='[object Array]')
            this.footPrint=obj;
    }
}

MapPrint.prototype = {
    toString: function () {
        return JSON.stringify(this.footPrint);
    },
    addItem:function(item){
        for(var i=0; i<this.footPrint.length; ++i){
            if(item == this.footPrint[i]){
                return;
            }
        }
        this.footPrint.push(item);
    }
}

//定义足迹👣
var Prints = function(obj){
    //序列化
    if(typeof obj === "string"){
        obj = JSON.parse(obj);
    }
    if(typeof obj === "object"){
        this.lng = obj.lng; //经度
        this.lat = obj.lat; //纬度
        this.desc = obj.desc; //备注
        this.author = obj.author; //作者
    }else{
        this.lng = "";
        this.lat = "";
        this.desc = "";
        this.author = "";
    }
};

Prints.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//合约
var mapFootPrints = function() {
    LocalContractStorage.defineProperties(this, {
        _name: null, //合约名字
        _creator: null  //合约创建者
    });

    LocalContractStorage.defineMapProperties(this, {
        //定义账户的Map容器，用来存放每一个用户账单
        "footPrints": {
            parse: function (value) {
                return new MapPrint(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });  
};

mapFootPrints.prototype = {

    //初始化
    init: function () {
        this._name = "map Foot Prints";
        this._creator = Blockchain.transaction.from;
    },

    //添加足迹数据
    addPrintData: function (lng, lat, desc) {

        //调用地址
        var from = Blockchain.transaction.from;

        //新增一个账单数据
        var mapItem = new Prints({
            "lng": lng,
            "lat": lat,
            "desc": desc,
            "author": from
        });

        var printsObj = this.footPrints.get(from) || new MapPrint();
            printsObj.addItem(mapItem);

        this.footPrints.set(from, printsObj);
    },

    //查询集合
    queryPrintsList: function(from){
        return this.footPrints.get(from)||[];
    }
};

module.exports = mapFootPrints;
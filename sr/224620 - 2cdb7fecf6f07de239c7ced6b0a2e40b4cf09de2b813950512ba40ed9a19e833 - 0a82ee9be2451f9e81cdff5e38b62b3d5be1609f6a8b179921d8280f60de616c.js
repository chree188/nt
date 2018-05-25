'use strict';

//定义用户数据
var User = function(obj) {
    this.urls=[]
    if (typeof obj != "undefined") {
        obj = JSON.parse(obj)
        if(Object.prototype.toString.call(obj)=='[object Array]')
            this.urls=obj;
    }
}

User.prototype = {
    toString: function () {
        return JSON.stringify(this.urls);
    },
    addUrl:function(url){
        for(var i=0;i<this.urls.length;++i)
            if(url == this.urls[i])
                return;
        this.urls.push(url);
    },
    removeUrl:function(url){
        for(var i=0;i<this.urls.length;++i) {
            if(url == this.urls[i]) {
                this.urls.splice(i,1);
                return;
            }
        }
    }
}

//定义图片数据
var Thumb = function(obj){
    //序列化
    if(typeof obj === "string"){
        obj = JSON.parse(obj);
    }

    if(typeof obj === "object"){
        this.url = obj.url; //图片url
        this.desc = obj.desc; //图片描述
        this.addDate = obj.addDate; //添加时间
        this.author = obj.author; //图片作者
    }else{
        this.url = "";
        this.desc = "";
        this.addDate = "";
        this.author = "";
    }
};

Thumb.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//超星私人图库智能合约
var SuperstarGallery = function() {
    LocalContractStorage.defineProperties(this, {
        _name: null, //合约名字
        _creator: null  //合约创建者
    });

    LocalContractStorage.defineMapProperties(this, {
        //定义图库的Map容器，用来存放每一个图片的信息
        "thumbs": {
            parse: function (value) {
                return new Thumb(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        //定义用户的Map容器，用来存放每一个用户的图集信息
        "users": {
            parse: function (value) {
                return new User(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });  
};

SuperstarGallery.prototype = {

    //初始化
    init: function () {
        this._name = "SuperstarGallery of Nebulas";
        this._creator = Blockchain.transaction.from;
    },

    //添加日记数据
    addImage: function (url, desc) {

        if(url === ""){
            throw new Error("图片地址不能为空！");
        }
        if(desc === ""){
            throw new Error("图片描述不能为空！");
        }

        //判断图片是否存在
        if(this.thumbs.get(url)){
            throw new Error("图片地址已经存在！");
        }

        //调用地址
        var from = Blockchain.transaction.from;

        //新增一个日记数据
        var thumbsItem = new Thumb({
            "url": url,
            "desc": desc,
            "addDate": Blockchain.transaction.timestamp.toString(10),
            "author": from
        });

        this.thumbs.set(url, thumbsItem);
        var user = this.users.get(from) || new User();
        user.addUrl(thumbsItem);
        this.users.set(from, user);
    },

    //查询日记数据
    getImageInfo: function (url) {
        if(url === ""){
            throw new Error("图片地址不存在！");
        }
        return this.thumbs.get(url);
    },

    //查询图片列表
    queryImageList: function(from){
        return this.users.get(from)||[];
    }
};

module.exports = SuperstarGallery;
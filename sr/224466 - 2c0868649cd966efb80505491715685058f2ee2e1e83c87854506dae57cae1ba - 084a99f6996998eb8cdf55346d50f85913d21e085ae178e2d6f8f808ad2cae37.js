'use strict';

//定义对象
var Img = function(obj){

    //序列化
    if(typeof obj === "string"){
        obj = JSON.parse(obj);
    }

    if(typeof obj === "object"){
        this.imgUrl = obj.imgUrl; //图片URL
        this.desc = obj.desc; //图片描述
        this.author = obj.author; //创建作者
    }else{
        this.imgUrl = "";
        this.desc = "";
        this.author = "";
    }
};

Img.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//合约
var ImgStory = function() {

    LocalContractStorage.defineProperties(this, {
        _name: null, //合约名字
        _creator: null  //合约创建者
    });

    LocalContractStorage.defineMapProperties(this, {
        //定义Map容器，用来存放数据
        "images": {
            parse: function (value) {
                return new Img(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });
};

ImgStory.prototype = {

    //初始化
    init: function () {
        this._name = "";
        this._creator = Blockchain.transaction.from;
    },

    //添加图片数据
    pushImgInfo: function (imgUrl, desc) {

        if(imgUrl === ""){
            throw new Error("请输入图片地址");
        }
        if(desc === ""){
            throw new Error("请添加图片描述");
        }

        var from = Blockchain.transaction.from;
        var imgItem = this.images.get(imgUrl);

        //判断图片描述是否存在
        if(imgItem){
            throw new Error("这个图片已经存在了哦~");
        }

        //新增一个图片数据
        var imgItem = new Img({
            "imgUrl": imgUrl,
            "desc": desc,
            "author": from
        });

        this.images.put(imgUrl,imgItem);
    },

    //查询数据
    getImgInfo: function (imgUrl){
        if(imgUrl === ""){
            throw new Error("图片地址为空...");
        }
        return this.images.get(imgUrl);
    }
};

module.exports = ImgStory;
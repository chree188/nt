"use strict";

var  Phrase = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.author = obj.author;
    } else {
        this.key = "";
        this.author = "";
    }
};

Phrase.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Idiom = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Phrase(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
};

Idiom.prototype = {
    init: function () {
        // todo
        var size = 0;
        var key = "星云密布";
        var author = "小星星";
        this.size = size;
        this.arrayMap.put(size, key);

        var init_dict = new Phrase();
        init_dict.author = author;
        init_dict.key = key;

        this.repo.put(key, init_dict);
    },

    save: function (key) {
        key = key.trim();
        if (key === ""){
            throw new Error("接龙词语不能为空");
        }
        if ( key.length != 4){
            throw new Error("请输入四字词语")
        }
        var reg = "/^[/u4E00-/u9FA5]+$/";
        if(!reg.test(str)){
            throw new Error("请输入汉字")
        }

        var top = this.getTop();

        if(key[0] != top[3] ){
            throw new Error("上一个词语的词尾不相符");
        }

        var from = Blockchain.transaction.from;
        var item = this.repo.get(key);
        if (item){
            throw new Error("这个词已经用过了");
        }

        item = new Phrase();
        item.author = from;
        item.key = key;
        this.repo.put(key, item);

        var index = this.size+1;
        this.arrayMap.put(index, key);
        this.size +=1;
        return this.repo.get(key);
    },
    getTop:function () {
       return  this.arrayMap.get(this.size);
    },
    get:function (key) {
        return this.repo.get(key);
    },
    getSize:function () {
        return this.size;
    },
    getmap:function (size) {
      return   this.arrayMap.get(size);
    },
    getAll:function () {
        var result  = [];
        var max =  this.size;
        for(var i=0;i<=max;i++){
            var key = this.arrayMap.get(i);
            var object = this.repo.get(key);
            result[i] =object ;
        }
        return result;
    }
};
module.exports = Idiom;
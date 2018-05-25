"use strict";

//画画信息
var DrawPictureInfo = function(str){
    if(str){
        var obj = JSON.parse(str);
        this.name = obj.name;
        this.url = obj.url;
        this.address = obj.address;
    }else{
        this.name = '';
        this.url = '';
        this.address = '';
    }

}

DrawPictureInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};



var DrawPicture = function(){
     LocalContractStorage.defineMapProperty(this, "dr", {
        parse: function (text) {
            return new DrawPictureInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

DrawPicture.prototype = {
    init: function () {
        // todo
    },

    save: function(name, url){
        console.log(name);
        console.log(url);
        name = name.toString().trim();
        url = url.toString().trim();
        if (name === "" || url === ""){
            throw new Error("empty name / url");
        }
        if (name.length > 2000 || url.length > 2000){
            throw new Error("name / url exceed limit length")
        }
        var from = Blockchain.transaction.from;
        var Picture = this.dr.get(name);
        if (Picture){
            throw new Error("该名称已经存在");
        }
        Picture = new DrawPictureInfo();
        Picture.address = from;
        Picture.name = name;
        Picture.url = url;
        this.dr.put(name, Picture);
    },

    getPicture: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.dr.get(name);
    }
};
module.exports = DrawPicture;
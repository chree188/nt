"use strict";

var Photo = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.url = o.url;
        this.thumbnail = o.thumbnail;
        this.date = o.date;
        this.id = o.id;

        this.remark = o.remark;
        this.blur = o.blur;
    } else {
        this.url = '';
        this.thumbnail = '';
        this.date = '';
        this.id = '';

        this.remark = '';
        this.blur = '';

    }
};

Photo.prototype.toString = function () {
    return JSON.stringify(this);
};

function Wallpaper() {

    LocalContractStorage.defineMapProperty(this, "photos", {
        parse: function (text) {
            return new Photo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "records");

    LocalContractStorage.defineProperties(this, {
        size: 0
    });

}

Wallpaper.prototype.init = function () {
    this.size = 0;
    // this.records = [];
};

Wallpaper.prototype.get_photos = function (pageIndex, pageMaxSize) {

    pageIndex = parseInt(pageIndex);
    pageMaxSize = parseInt(pageMaxSize);

    var size = this.size;
    var list = [];

    var total = Math.ceil(size/pageMaxSize);

    var start = pageIndex * size;
    var end = pageIndex * size + pageMaxSize;
    end = (end > size)? size : end;

    for(var i=start;i<end;i++){
        var photo = this.photos.get(i);
        var new_photo = {
            url: photo.url,
            thumbnail: photo.thumbnail,
            date: photo.date,
            id: photo.id,
            remark: photo.remark,
            blur: photo.blur
        };
        photo && list.push( new_photo );
    }

    return {
        total: total,
        photos: list
    };


};

Wallpaper.prototype.get_photo = function (id) {
    var from = Blockchain.transaction.from;

    var payKey = from +'_'+ id;
    var hasPay = this.records.get(payKey);

    if(hasPay){
        return this.photos.get(id);
    }

    return null;
};

Wallpaper.prototype.pay_photo = function (id) {
    var from = Blockchain.transaction.from;

    var key = from +'_'+ id;

    this.records.put(key, true);

    // this.records.put(from, id);
    // return this.photos.get(id);
    return key;
};

Wallpaper.prototype.add_photo = function (url ,remark, blur ,thumbnail) {
    var index = this.size;

    var photo = new Photo();

    photo.url = url;
    photo.remark = remark;
    photo.thumbnail = thumbnail;
    photo.blur = blur;
    photo.date = Blockchain.transaction.timestamp;
    photo.id = index + '';

    this.photos.put(photo.id, photo);
    this.size = this.size + 1;
    return photo;
};


module.exports = Wallpaper;

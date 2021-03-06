"use strict";

var PhotoPlatform = function () {
    LocalContractStorage.defineMapProperty(this, "photoInfos");
    LocalContractStorage.defineProperty(this, "photos");
};

PhotoPlatform.prototype = {
    init: function () {
        this.photos = [];
    },
    post: function (title, imageUrls, price) {
        if (title === '') {
            throw new Error('标题内容不能为空！');
        }
        if (title.length > 32) {
            throw new Error('标题内容不能超过32个字符！');
        }
        price = new BigNumber(price);
        imageUrls = JSON.parse(imageUrls);
        if (imageUrls.length == 0) {
            throw new Error('不能没有图片！');
        }
        var from = Blockchain.transaction.from;
        var photos = this.photos;
        var id = photos.length + 1;
        var photo = {
            'from': from,
            'ts': new Date().getTime(),
            'id': id
        }
        photos.push(photo);
        this.photos = photos;
        var photoInfo = {
            'imageUrls': imageUrls,
            'price': price
        }
        this.photoInfos.put(id, photoInfo);
    },
    getHotPhotos: function (offset, size) {
        var photos = this.photos;
        photos = photos.sort(function (a, b) {
            var aInfo = this.photoInfos.get(a.id);
            var bInfo = this.photoInfos.get(b.id);
            if(aInfo.buyers.length == 0 && bInfo.buyers.length == 0){
                return a.price - b.price;
            }else{
                return -(a.price * aInfo.buyers.length - b.price * bInfo.buyers.length);
            }
        })
        return this._page(photos, offset, size);
    },
    _page: function (items, offset, size) {
        var start = offset;
        var end = start + size;
        if(end > items.length)[
            end = items.length;
        ]
        var result = [];
        for (var i = start; i < end; i++) {
            var item = items[i];
            if (item) {
                result.push(items[i]);
            }
        }
        return result;
    },
    getNewPhotos: function (offset, size) {
        var photos = this.photos;
        photos = photos.sort(function (a, b) {
            return b.ts - a.ts;
        })
        return this._page(photos, offset, size);
    },
    buy: function (id) {
        var phototInfo = this.photoInfos.get(id);
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if(phototInfo.price === value){
            var buyers = phototInfo.buyers || [];
            buyers.push(from);
            phototInfo.buyers = buyers;
            this.photoInfos.put(id, phototInfo);
        }else{
            throw new Error('Error');
        }

    }
};
module.exports = PhotoPlatform;
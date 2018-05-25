"use strict";

var PhotoPlatform = function () {
    LocalContractStorage.defineMapProperty(this, "photoInfos");
    LocalContractStorage.defineMapProperty(this, "userInfos");
    LocalContractStorage.defineProperty(this, "photos");
    LocalContractStorage.defineProperty(this, "users");
};

PhotoPlatform.prototype = {
    init: function () {
        this.photos = [];
        this.users = [];
    },
    post: function (title, imageUrls, price, avatar) {
        if (title === '') {
            throw new Error('标题内容不能为空！');
        }
        if (title.length > 64) {
            throw new Error('标题内容不能超过64个字符！');
        }
        price = new BigNumber(price);
        imageUrls = JSON.parse(imageUrls);
        if (imageUrls.length == 0) {
            throw new Error('不能没有图片！');
        }
        if(imageUrls.length > 12){
            throw new Error('图片不能超过12张！');
        }
        var from = Blockchain.transaction.from;
        var photos = this.photos;
        var id = photos.length + 1;
        var photo = {
            'title':title,
            'from': from,
            'ts': new Date().getTime(),
            'id': id,
            'price': price,
            'count': imageUrls.length
        }
        photos.push(photo);
        this.photos = photos;
        var photoInfo = {
            'imageUrls': imageUrls,
            'price': price,
            'buyers': [],
            'from': from,
            'good': 0,
            'bad': 0
        }
        this.photoInfos.put(id, photoInfo);

        //更新用户发布次数
        this._initUserInfo(from, avatar);
        var userInfo = this.userInfos.get(from);
        userInfo.post++;
        this.userInfos.put(from, userInfo);

        return 'success';
    },
    getHotPhotos: function (offset, size) {
        var photos = this.photos;
        var photoInfos = this.photoInfos;
        photos = photos.sort(function (a, b) {
            var aInfo = photoInfos.get(a.id);
            var bInfo = photoInfos.get(b.id);
            if(aInfo.buyers.length == 0 && bInfo.buyers.length == 0){
                return a.price - b.price;
            }else{
                return -(a.price * (aInfo.buyers.length + aInfo.good-aInfo.bad) - b.price * (bInfo.buyers.length + bInfo.good - bInfo.bad));
            }
        })
        return this._page(photos, offset, size);
    },
    _initUserInfo: function (from, avatar) {
        var userInfo = this.userInfos.get(from);
        if(!userInfo){
            var users = this.users;
            users.push(from);
            this.users = users;

            userInfo = {
                'income': 0,
                'spend': 0,
                'good': 0,
                'bad': 0,
                'post': 0,
                'avatar': avatar
            }
            this.userInfos.put(from, userInfo);
        }
    },
    _page: function (items, offset, size) {
        var start = offset;
        var end = start + size;
        if(end > items.length) {
            end = items.length;
        }
        var result = [];
        for (var i = start; i < end; i++) {
            var item = items[i];
            if (item) {
                var photoInfo = this.photoInfos.get(item.id);
                item.buyers = photoInfo.buyers;
                item.good = photoInfo.good;
                item.bad = photoInfo.bad;
                item.ext = photoInfo.ext;
                item.avatar = this.userInfos.get(photoInfo.from).avatar;
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
    buy: function (id, avatar) {
        var phototInfo = this.photoInfos.get(id);
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        this._initUserInfo(from, avatar);
        if(phototInfo.price == value){
            var result = Blockchain.transfer(phototInfo.from, value);
            if(result){
                var userInfo = this.userInfos.get(phototInfo.from);
                userInfo.income += value;
                this.userInfos.put(phototInfo.from, userInfo);

                var userInfo2 = this.userInfos.get(from);
                userInfo2.spend += value;
                this.userInfos.put(from, userInfo2);
            }
            var buyers = phototInfo.buyers;
            var buyer = {
                'from': from,
                'ts': new Date().getTime(),
                'success': result,
                'like': 0
            }
            buyers.push(buyer);
            phototInfo.buyers = buyers;
            this.photoInfos.put(id, phototInfo);


            var ext = [];
            ext.push(phototInfo.price);
            ext.push(value);
            ext.push('pay:' + result);
            phototInfo.ext = ext;
            this.photoInfos.put(id, phototInfo);
        }else{
            throw new Error('Error');
        }
    },
    getImageUrls: function (id, from) {
        var photoInfo = this.photoInfos.get(id);
        if(photoInfo.from == from){
            return photoInfo.imageUrls;
        }
        for(var i=0;i<photoInfo.buyers.length;i++){
            if(photoInfo.buyers[i].from == from && photoInfo.buyers[i].success == true){
                return photoInfo.imageUrls;
            }
        }
        return [];
    },
    good: function (id) {
        var photoInfo = this.photoInfos.get(id);
        var from = Blockchain.transaction.from;
        for(var i=0;i<photoInfo.buyers.length;i++){
            if(photoInfo.buyers[i].from == from && photoInfo.buyers[i].success == true){
                var userInfo = this.userInfos.get(photoInfo.from);
                var old = photoInfo.buyers[i].like;
                if(old == 0){
                    photoInfo.good++;
                    userInfo.good++;
                }else if(old == -1){
                    photoInfo.bad--;
                    photoInfo.good++;
                    userInfo.good++;
                    userInfo.bad--;
                }else if(old == 1){
                    // do nothind
                }
                this.userInfos.put(photoInfo.from, userInfo);
                photoInfo.buyers[i].like = 1;
                this.photoInfos.put(id, photoInfo);
                return 'success';
            }
        }
        return 'do not match buyer';
    },
    bad: function (id) {
        var photoInfo = this.photoInfos.get(id);
        var from = Blockchain.transaction.from;
        for(var i=0;i<photoInfo.buyers.length;i++){
            if(photoInfo.buyers[i].from == from && photoInfo.buyers[i].success == true){
                var userInfo = this.userInfos.get(photoInfo.from);
                var old = photoInfo.buyers[i].like;
                if(old == 0){
                    userInfo.bad++;
                    photoInfo.bad++;
                }else if(old == -1){
                    // do nothind
                }else if(old == 1){
                    photoInfo.good--;
                    photoInfo.bad++;
                    userInfo.good--;
                    userInfo.bad++;
                }
                this.userInfos.put(photoInfo.from, userInfo);
                photoInfo.buyers[i].like = -1;
                this.photoInfos.put(id, photoInfo);
                return 'success';
            }
        }
        return 'do not match buyer';
    },
    getHotUsers: function (offset, size) {
        var users = this.users;
        var t = this;
        users = users.sort(function (a, b) {
            var aInfo = t.userInfos.get(a);
            var bInfo = t.userInfos.get(b);
            return bInfo.income + bInfo.spend - aInfo.income - aInfo.spend;
        })
        var start = offset;
        var end = start + size;
        if(end > users.length) {
            end = users.length;
        }
        var result = [];
        for (var i = start; i < end; i++) {
            var item = users[i];
            if (item) {
                var photoInfo = this.userInfos.get(item);
                photoInfo.address = item;
                result.push(photoInfo);
            }
        }
        return result;
    },
    getAvatar: function (from) {
        var userInfo = this.userInfos.get(from);
        if(userInfo){
            return userInfo.avatar;
        }
        return '';
    }
};
module.exports = PhotoPlatform;
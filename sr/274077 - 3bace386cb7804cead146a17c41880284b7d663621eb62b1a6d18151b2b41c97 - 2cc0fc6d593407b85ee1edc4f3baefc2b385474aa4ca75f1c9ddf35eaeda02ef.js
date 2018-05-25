"use strict";

var BookmarkItem = function(text) {
    if(text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.time = obj.time;
        this.type = obj.type; // 'url' or 'image'
        this.url = obj.url;
        this.title = obj.title;
    } else {
        this.id = '';
        this.time = 0;
        this.type = '';
        this.url = '';
        this.title = '';
    }
};

BookmarkItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var FavoritesItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id; // use tx id as poetry id
        this.name = obj.name; // 收藏夹名称
        this.creatorAddress = obj.creatorAddress;
        this.agreeCount = obj.agreeCount; // 点赞的数量
        this.disagreeCount = obj.disagreeCount; // 踩的数量
        this.agreedUsers = obj.agreedUsers; // 点赞的用户地址列表
        this.disagreedUsers = obj.disagreedUsers; // 踩的用户地址列表
        this.items = obj.items; // 收藏夹内容, array of BookmarkItem
        this.time = obj.time; // 创建时间戳，秒数
        this.deleted = obj.deleted; // 是否已被删除
    } else {
        this.id = '';
        this.name = '';
        this.creatorAddress = '';
        this.agreeCount = 0;
        this.disagreeCount = 0;
        this.agreedUsers = [];
        this.disagreedUsers = [];
        this.items = [];
        this.time = 0;
        this.deleted = false;
    }
};

FavoritesItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var FavoritesService = function () {
    LocalContractStorage.defineMapProperty(this, "config", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // favoritesId => FavoritesItem
    LocalContractStorage.defineMapProperty(this, "favoritesRepo", {
        parse: function (text) {
            return new FavoritesItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // creatorUserAddr => array of FavoritesItemId
    LocalContractStorage.defineMapProperty(this, "userFavoritesRepo", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // userAddress => array of FavoritesItemId
    LocalContractStorage.defineMapProperty(this, "userWatchedFavoritesRepo", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
};

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isDigit(str) {
    return str.length === 1 && str.match(/\d/i);
}

var maxBoardCount = 1000;

FavoritesService.prototype = {
    init: function () {
        this.config.set("owner", Blockchain.transaction.from); // 合约所有者
        this.config.set('favorites', []); // 所有收藏夹的id列表
        // TODO: board
    },

    getOwner: function () {
        return this.config.get('owner');
    },
    getFavoritesList: function () {
        var items = this.config.get('favorites');
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var item = this.favoritesRepo.get(items[i]);
            if (item) {
                result.push(item);
            }
        }
        return result;
    },
    getFavoritesListCreatedByUser: function (address) {
        var itemIds = this.userFavoritesRepo.get(address) || [];
        var result = [];
        for (var i = 0; i < itemIds.length; i++) {
            var item = this.favoritesRepo.get(itemIds[i]);
            if (item) {
                result.push(item);
            }
        }
        return result;
    },
    // 获取用户关注的收藏夹列表
    getFavoritesListWatchedByUser: function (address) {
        var itemIds = this.userWatchedFavoritesRepo.get(address) || [];
        var result = [];
        for (var i = 0; i < itemIds.length; i++) {
            var item = this.favoritesRepo.get(itemIds[i]);
            if (item) {
                result.push(item);
            }
        }
        return result;
    },
    // 创建新收藏夹
    createFavorites: function(name) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        if(!name || name.length<5) {
            throw new Error("favorites name can't be empty and length must be at least 5 chars");
        }
        
        var item = new FavoritesItem();
        item.id = id;
        item.name = name;
        item.creatorAddress = from;
        item.time = time;
        this.favoritesRepo.set(id, item);

        var userCreatedFavorites = this.userFavoritesRepo.get(from) || [];
        userCreatedFavorites.push(id);
        this.userFavoritesRepo.set(from, userCreatedFavorites);

        var favoritesIds = this.config.get('favorites');
        favoritesIds.push(id);
        this.config.set('favorites', favoritesIds);
    },
    // 在收藏夹中添加/修改书签
    createOrUpdateBookmark: function(favoritesId, type, url, title) {
        var from = Blockchain.transaction.from;
        var id = Blockchain.transaction.hash;
        var time = Blockchain.block.timestamp;
        var favorites = this.favoritesRepo.get(favoritesId);
        if(!favorites || favorites.creatorAddress !== from) {
            throw new Error("Can't find this favorites or it's not yours");
        }
        if(!type || !url || !title) {
            throw new Error("invalid arguments");
        }
        var found = false;
        var bookmark = null;
        for(var i=0;i<favorites.items.length;i++) {
            if(favorites.items[i].url === url) {
                found = true;
                bookmark = favorites.items[i];
                break;
            }
        }
        if(found) {
            bookmark.type = type;
            bookmark.title = title;
            this.favoritesRepo.set(favoritesId, favorites);
            return;
        } else {
            bookmark = new BookmarkItem();
            bookmark.id = id;
            bookmark.time = time;
            bookmark.type = type;
            bookmark.url = url;
            bookmark.title = title;
            favorites.items.push(bookmark);
            this.favoritesRepo.set(favoritesId, favorites);
            return;
        }
    },
    // watch/unwatch favorites, watch==true means watch, watch==false means unwatch
    watchOrUnwatchFavorites: function(favoritesId, watch) {
        var from = Blockchain.transaction.from;
        var favorites = this.favoritesRepo.get(favoritesId);
        if(!favorites) {
            throw new Error("Can't find this favorites");
        }
        if(favorites.createFavorites === from) {
            throw new Error("this is your own favorites");
        }
        var userWatchedFavorites = this.userWatchedFavoritesRepo.get(from) || [];
        if(watch) {
            if(userWatchedFavorites.indexOf(favoritesId)>=0) {
                throw new Error("you have watched this favorites before");
            }
            userWatchedFavorites.push(favoritesId);
            this.userWatchedFavoritesRepo.set(from, userWatchedFavorites);
        } else {
            if(userWatchedFavorites.indexOf(favoritesId)<0) {
                throw new Error("you have not watched this favorites before");
            }
            var idx = userWatchedFavorites.indexOf(favoritesId);
            userWatchedFavorites.splice(idx, 1);
            this.userWatchedFavoritesRepo.set(from, userWatchedFavorites);
        }
    },
    
    getFavoritesById: function (id) {
        return this.favoritesRepo.get(id);
    },
    voteFavorites: function (id, agree) {
        // 给收藏夹投票
        var from = Blockchain.transaction.from;
        var item = this.favoritesRepo.get(id);
        if (!item) {
            throw new Error("can't find favorites " + id);
        }
        
        if (item.agreedUsers.indexOf(from) >= 0 || item.disagreedUsers.indexOf(from) >= 0) {
            throw new Error("you voted to this favorites before, so you can't vote for it again");
        }
        if (agree) {
            item.agreeCount += 1;
            item.agreedUsers.push(from);
        } else {
            item.disagreeCount += 1;
            item.disagreedUsers.push(from);
        }
        this.favoritesRepo.set(item.id, item);
    }
};
module.exports = FavoritesService;

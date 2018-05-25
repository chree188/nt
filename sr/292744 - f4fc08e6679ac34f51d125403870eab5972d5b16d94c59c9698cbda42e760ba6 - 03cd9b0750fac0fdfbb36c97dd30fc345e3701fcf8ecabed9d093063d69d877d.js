"use strict";

var Music = function(text) {
	if (text) {
		var obj = JSON.parse(text)
		this.userId = obj.userId
		this.musicId = obj.musicId
		this.provider = obj.provider
		this.name = obj.name
	}
};


Music.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var YueTing = function () {
    LocalContractStorage.defineMapProperty(this, "users");

    LocalContractStorage.defineMapProperty(this, "musics", {
        parse: function (text) {
            return new Music(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "allMusics", {
        parse: function (text) {
            return new Music(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "likes", {
        parse: function (text) {
            return new Music(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

YueTing.prototype = {
    init: function () {
        this.size = 1
        this.users.put(0, "test")
    },

    isExist: function(key) {
        for (var i = 0; i < this.size; i++) {
            if (this.users.get(i) == key) {
                return true
            }
        }
        return false
    },

    size: function() {
        return this.size
    },

    createUser: function(userId) {
        key = userId.trim()
        if (key == "") {
            throw new Error("empty key / value")
        }

        if (this.isExist(key)) {
            throw new Error("user has exists")
        }
        index = this.size
        this.users.set(index, key)
        this.size += 1
    },

    getUsers: function() {
        var ret = ""
        if (this.size > 0) {
            for (var i = 0; i < this.size - 1; i++) {
                ret += this.users.get(i) + ","
            }
            ret += this.users.get(this.size - 1)
            return ret
        } else {
            return this.users.get(0)
        }
    },

    getUser: function(userId) {
        key = userId.trim()
        if (key === "") {
            throw new Error("empty key")
        }
        return '{ "musics": ' + this.musics.get(key).toString() + ', "likes":' + this.likes.get(key).toString() + "}"
    },

    getMusics: function(userId) {
        return this.musics.get(userId)
    },

    addMusic: function(userId, value) {
        key = userId.trim()
        value = value.trim()
        if (key === "" || value === ""){
            throw new Error("empty key / value")
        }

        var music = new Music(value)
        this.musics.set(key, music)
    },

    getLikes: function (userId) {
        key = userId.trim()
        if (key === "") {
            throw new Error("empty key")
        }
        return this.likes.get(key)
    },

    addLike: function (userId, value) {
        key = userId.trim()
        value = value.trim()
        if (key === "" || value === ""){
            throw new Error("empty key / value")
        }

        var music = new Music(value)
        this.likes.set(key, music)
    }
};

module.exports = YueTing;
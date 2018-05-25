'use strict';

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

var User = function(text) {
	if (text) {
		var obj = JSON.parse(text)
    this.index = 0
		this.userId = obj.userId
		this.walletAddr = obj.walletAddr
		this.name = obj.name
	}
};

User.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var YueTing = function () {
    LocalContractStorage.defineMapProperty(this, "usersIndexs");

    LocalContractStorage.defineMapProperty(this, "users");

    LocalContractStorage.defineMapProperty(this, "musics");

    LocalContractStorage.defineMapProperty(this, "likes");
};

YueTing.prototype = {
    init: function () {
        LocalContractStorage.set("users_num", 0);
        LocalContractStorage.set("users_index", 0);
    },

    checkProfile: function(profile) {
        if (typeof(profile) == "undefined") {
            throw new Error("userId cannot be empty")
        }
        var newUser = new User(profile)
        var userId = newUser.userId
        this.assertNotExist(userId)
        return newUser
    },

    _checkUser: function(userId) {
        if (typeof(userId) == "undefined") {
            throw new Error("userId cannot be empty")
        }
        //userId = userId.trim()
        if (userId == "") {
            throw new Error("userId cannot be empty")
        }
        return userId
    },

    assertExist: function(userId) {
        userId = this._checkUser(userId)
        if (this.isExist(userId)) {
            return userId
        } else {
            throw new Error("user doesn't exist")
        }
    },

    assertNotExist: function(userId) {
        userId = this._checkUser(userId)
        if (this.isExist(userId)) {
            throw new Error("user  exist")
        } else {
            return userId
        }
    },

    isExist: function(userId) {
        userId = this._checkUser(userId)
        console.debug("user of id ", this.users.get(userId))
        if (this.users.get(userId)) {
            return true
        } else {
            return false
        }
    },

    addUser: function (userId, profile) {
        console.debug("addUser userId:", userId, " profile:", profile)
        userId = this.assertNotExist(userId)
        var newUser = this.checkProfile(profile)
        // TODO check the newUser.userId match to userId
        var num = LocalContractStorage.get("users_num");
        num += 1
        if (num > 1000000) {
            throw new Error("not more user support")
        }
        LocalContractStorage.set("users_num", num);

        //index have some flaw, fix in the future
        var cur_index = LocalContractStorage.get("users_index")
        this.usersIndexs.put(cur_index, userId)
        newUser.index = cur_index
        cur_index += 1
        LocalContractStorage.set("users_index", cur_index)
        console.debug("before userId ", userId, "userInfo: ", newUser)
        this.users.put(userId, newUser.toString())
        console.debug("after userId ", userId,  "userInfo: ", this.users.get(userId))

        //addMusic, addLike throw erro if userId doesn't exist
        this.musics.set(userId, {})
        this.likes.set(userId, {})
        return this.users
    },

    userSize: function () {
        var num = LocalContractStorage.get("users_num");
        return num
    },

    getUser: function (userId) {
        console.debug("getUser userId ", userId)
        userId = this.assertExist(userId)
        var profile = this.users.get(userId)
        var musics = this.musics.get(userId)
        var likes = this.likes.get(userId)
        return {"profile": profile, "musics": musics, "likes": likes}
    },

    curIndex: function() {
        return cur_index = LocalContractStorage.get("users_index")
    },

    AllUsers: function(limit, offset) {
        var limit = parseInt(limit);
        var offset = parseInt(offset);
        var cur_index = LocalContractStorage.get("users_index")
        if (limit < 1) {
            limit = 1
        }
        if (offset < 1) {
            offset = 0
        }
        if (offset > cur_index) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > cur_index) {
            number = cur_index;
        }
        console.debug("limit: ", limit, " offset:", offset, " number:", number)
        var result  = "[";
        for (var i = offset; i < number-1; i++) {
            var userId = this.usersIndexs.get(i);
            var info = this.users.get(userId)
            console.debug("index: ", i, " userId:", userId, "info:", info)
            result +=  info +","
        }
        var userId = this.usersIndexs.get(number - 1);
        var info = this.users.get(userId)
        result += info + "]"
        return result
    },

    //TODO only the walletAdder owner can delete itself
    delUser: function (userId) {
        userId = this.assertExist(userId)
        var total_num = LocalContractStorage.get("users_num");
        LocalContractStorage.set("users_num", total_num - 1);
        this.users.del(userId)
        this.musics.del(userId)
        this.likes.del(userId)
    },

    getMusic: function (userId) {
        userId = this.assertExist(userId)
        return this.musics.get(userId)
    },

    addMusic: function (userId, music) {
        userId = this.assertExist(userId)
        var newElem = new Music(music)
        var oldValue = this.musics.get(userId)
        if (oldValue) {
            oldValue[newElem.musicId] = newElem
            this.musics.put(userId, oldValue)
        } else {
            var value = {}
            value[newElem.musicId] = newElem
            this.musics.put(userId, value)
        }
        return this.musics.get(userId)
    },

    delMusics: function (userId) {
        userId = this.assertExist(userId)
        this.musics.put(userId, {})
    },

    delMusic: function (userId, musicId) {
        userId = this.assertExist(userId)
        if (typeof(musicId) == "undefined") {
            throw new Error("musicId is empty, must be given")
        }
        var oldValue = this.musics.get(userId)
        if (oldValue) {
            delete oldValue[musicId]
            this.musics.put(userId, oldValue)
        } else {
            throw new Error("del music but music doesn't exist")
        }
        return this.musics.get(userId)
    },

    getLike: function (userId) {
        userId = this.assertExist(userId)
        return this.likes.get(userId)
    },

    addLike: function (userId, music) {
        userId = this.assertExist(userId)
        var newElem = new Music(music)
        var oldValue = this.likes.get(userId)
        if (oldValue) {
            oldValue[newElem.musicId] = newElem
            this.likes.put(userId, oldValue)
        } else {
            var value = {}
            value[newElem.musicId] = newElem
            this.likes.put(userId, value)
        }
        return this.likes.get(userId)
    },

    delLikes: function (userId) {
        userId = this.assertExist(userId)
        this.likes.set(userId, {})
    },

    delLike: function (userId, musicId) {
        userId = this.assertExist(userId)
        if (typeof(musicId) == "undefined") {
            throw new Error("musicId is empty, must be given")
        }
        var oldValue = this.likes.get(userId)
        if (oldValue) {
            delete oldValue[musicId]
            this.likes.put(userId, oldValue)
        } else {
            throw new Error("del like but music doesn't exist")
        }
        return this.likes.get(userId)
    }
};

module.exports = YueTing;
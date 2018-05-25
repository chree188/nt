"use strict";

var Blog = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.title = obj.title;
        this.authorName = obj.authorName;
        this.authorAddress = obj.authorAddress;
        this.postTime = obj.postTime;
        this.content = obj.content;    
    } else {
        this.id = "";
        this.title = "";
        this.authorName = "";
        this.authorAddress = "";
        this.postTime = "";
        this.content = "";
    }
};

Blog.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var OasisInfo = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.dappName = obj.dappName;
        this.creator = obj.creator;
        this.createTimestamp = obj.createTimestamp;
        this.creatorAddress = obj.creatorAddress;
        this.introduce = obj.introduce;
    } else {
        this.dappName = "";
        this.creator = "";
        this.createTimestamp = "";
        this.creatorAddress = "";
        this.introduce = "";
    }
}

OasisInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Oasis = function () {
    LocalContractStorage.defineProperties(this, {
        adminKey: null,
        blogCount: null,
        info: null
    });
    LocalContractStorage.defineMapProperty(this, "userNameMap");
    LocalContractStorage.defineMapProperty(this, "userBlogMap");     
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new Blog(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Oasis.prototype = {
    init: function (dappName, creatorName, introduce, adminKey) {
        this.blogCount = 0;
        this.adminKey = adminKey;
        var dappInfo = new OasisInfo();
        dappInfo.dappName = dappName;
        dappInfo.creator = creatorName;
        dappInfo.createTimestamp = Blockchain.transaction.timestamp;
        dappInfo.creatorAddress = Blockchain.transaction.from;
        dappInfo.introduce = introduce;
        this.info = dappInfo;
    },

    save: function (title, authorName, content) {
        title = title.trim();
        authorName = authorName.trim();
        content = content.trim();
        if (title === "" || content === "") {
            throw new Error("title / content can not be empty");
        }
        if (title.length > 35 || authorName.length > 15 || content.length > 10240) {
            throw new Error("title / authorName / content exceed limit length");
        }

        var userAddress = Blockchain.transaction.from;
        if (authorName === "") {
            //if already exits this user address name mapping , use this name
            var userName = this.userNameMap.get(userAddress);
            if (userName) {
                authorName = userName;
            }   
        } else {
            this.userNameMap.put(userAddress, authorName);
        }
   
        var currTrans = Blockchain.transaction;
        var blog = new Blog();
        blog.id = currTrans.hash;
        blog.title = title;
        blog.authorName = authorName;
        blog.authorAddress = currTrans.from;
        blog.postTime = currTrans.timestamp;
        blog.content = content;
        
        var index = this.blogCount;
        this.arrayMap.put(index, blog.id);
        this.dataMap.put(blog.id, blog);
        
        var blogIndexArray = this.userBlogMap.get(userAddress);
        if (blogIndexArray) {
            blogIndexArray.push(index);
        } else {
            blogIndexArray = new Array();
            blogIndexArray.push(index);
        }

        this.blogCount += 1;
    },

    searchByAddress: function (address, limit, offset) {
        address = address.trim();
        if (address === "") {
            throw new Error("empty nebulas address");
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.blogCount) {
            throw new Error("offset is not valid");
        }

        var blogArray  = new Array();
        var blogIndexArray = this.userBlogMap.get(address);
        if (blogIndexArray) {
            
            var number = offset + limit;
            if (number > blogIndexArray.length) {
              number = blogIndexArray.length;
            }
    
            for(var i=offset; i<number; i++) {
                var index = blogIndexArray[i];
                var blogId = this.arrayMap.get(index);
                var blog = this.dataMap.get(blogId);
                blogArray.push(blog);
            }
           
        }
        return blogArray;
    },

    countByAddress: function(address) {
        address = address.trim();
        if (address === "") {
            throw new Error("empty nebulas address");
        }

        var blogIndexArray = this.userBlogMap.get(address);
        if (blogIndexArray) {
            return blogIndexArray.length;
        }

        return 0;
    },

    changeAdminKey: function(adminKey) {
        var currAddress = Blockchain.transaction.from;
        if (this.adminKey != currAddress) {
            throw new Error("you are not creator, change adminKey is not valid")
        }
        this.adminKey = adminKey;
    },

    searchByTitleKeywords: function (adminKey, keyword) {
        keyword = keyword.trim();
        if (keyword === "") {
            throw new Error("empty keyword");
        }
        if (adminKey != this.adminKey) {
            throw new Error("adminKey incorrect")
        }

        var blogArray  = new Array();
        var number = this.blogCount;
        for(var i=0; i<number; i++) {
            var key = this.arrayMap.get(i);
            var blog = this.dataMap.get(key);
            blogArray.push(blog);
        }
        
        return blogArray;
    },

    count: function () {
        return this.blogCount;
    },

    getDappInfo: function() {
        return this.info;
    },

    get: function (id) {
        id = id.trim();
        if (id === "") {
            throw new Error("empty blog id");
        }
        return this.dataMap.get(id);
    },

    iterate: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.blogCount) {
           throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.blogCount) {
          number = this.blogCount;
        }

        var blogArray  = new Array();
        for(var i=offset; i<number; i++) {
            var key = this.arrayMap.get(i);
            var blog = this.dataMap.get(key);
            blogArray.push(blog);
        }
        return blogArray;
    }

};

module.exports = Oasis;
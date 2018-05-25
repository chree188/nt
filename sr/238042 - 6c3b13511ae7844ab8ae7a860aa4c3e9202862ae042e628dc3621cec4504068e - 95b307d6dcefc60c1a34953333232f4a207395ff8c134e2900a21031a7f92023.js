"use strict";

var BlogItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.blog = obj.blog;
	} else {
	    this.name = "";
	    this.blog = "";
	}
};

BlogItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BlogList = function(text) {
    if (text) {
		var obj = JSON.parse(text);
		this.author = obj.author;
		this.bloglist = obj.bloglist;
	} else {
	    this.author = "";
	    this.bloglist = [];
	}
}

BlogList.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var DBlog = function () {
    LocalContractStorage.defineMapProperty(this, "blogstore", {
        parse: function (text) {
            return new BlogItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "bloglist", {
        parse: function (text) {
            return new BlogList(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

DBlog.prototype = {
    init: function () {
        // todo
    },

    getMyList: function () {
        var from = Blockchain.transaction.from;
        return this.bloglist.get(from);
    },

    getUserList: function (from) {
        return this.bloglist.get(from);
    },

    saveBlog: function (name, blog) {

        name = name.trim();
        blog = blog.trim();
        if (name === "" || blog === ""){
            throw new Error("empty name / blog");
        }
        if (name.length > 64){
            throw new Error("name exceed limit length")
        }
        if (blog.length > 3000){
            throw new Error("blog exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var height = Blockchain.transaction.height;
        var timestamp = Blockchain.transaction.timestamp;

        var blogid = from + "_" + timestamp

        // check
        var blogItem = this.blogstore.get(blogid);
        if (blogItem){
            throw new Error("already has this blog");
        }
        
        // write to blockchain
        blogItem = new BlogItem();
        blogItem.name = name;
        blogItem.blog = blog;
        this.blogstore.put(blogid, blogItem);

        // write list to blockchain
        var blogList = this.bloglist.get(from);
        var newBlogList = new BlogList();
        newBlogList.author = from;
        if (blogList) {
            var currentlist = blogList.bloglist;
            currentlist.push({"name": name, "timestamp": timestamp});
            newBlogList.bloglist = currentlist;
        } else {
            newBlogList.bloglist = [{"name": name, "timestamp": timestamp}];
        }
        this.bloglist.put(from, newBlogList);
    },

    updateBlog: function (timestamp, name, blog) {
        timestamp = timestamp.trim();
        name = name.trim();
        blog = blog.trim();
        if (timestamp === "" || name === "" || blog === ""){
            throw new Error("empty timestamp / name / blog");
        }
        if (name.length > 64){
            throw new Error("name exceed limit length")
        }
        if (blog.length > 3000){
            throw new Error("blog exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var blogid = from + "_" + timestamp

        // check
        var blogItem = this.blogstore.get(blogid);
        if (blogItem){
            // write to blockchain
            blogItem = new BlogItem();
            blogItem.name = name;
            blogItem.blog = blog;
            this.blogstore.put(blogid, blogItem);
        } else {
            throw new Error("item not exist");
        }
    },

    getBlog: function (from, timestamp) {
        timestamp = timestamp.trim();
        if ( from === "") {
            throw new Error("from name")
        }
        if ( timestamp === "") {
            throw new Error("empty timestamp")
        }
        var blogid = from + "_" + timestamp
        return this.blogstore.get(blogid);
    }
};
module.exports = DBlog;
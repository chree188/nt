"use strict";
var EntityFactory = function () {
    var e = function (text) {
        if (text) {
            var kv = JSON.parse(text);
            for (var k in kv) {
                this[k] = kv[k];
            }
        }
    };

    e.prototype = {
        toString: function () {
            return JSON.stringify(this);
        }
    };

    return e;
};

var Post = EntityFactory();
var Comment = EntityFactory();


var Blog = function () {
    LocalContractStorage.defineProperty(this, "post_capacity");
    LocalContractStorage.defineMapProperty(this, "post_author_indexies");
    LocalContractStorage.defineProperty(this, "comment_capacity");
    LocalContractStorage.defineMapProperty(this, "comment_from_indexies");
    LocalContractStorage.defineMapProperty(this, "nickName");
    LocalContractStorage.defineMapProperty(this, "posts", {
        parse: function (text) {
            return new Post(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "comments", {
        parse: function (text) {
            return new Comment(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
};


Blog.prototype = {
    init: function () {
        this.post_capacity = 0;
        this.comment_capacity = 0;
    },

    set_nickname: function (nickname) {
        var address = Blockchain.transaction.from;
        if (!this.nickName.get(address)) {
            this.nickName.put(address, nickname);
            return "successful";
        }
        return "failed";
    },

    get_nickname: function () {
        var address = Blockchain.transaction.from;
        return this.nickName.get(address);
    },

    show_posts: function (limit, offset) {
        var limit = parseInt(limit);
        var offset = parseInt(offset);
        if (offset > this.post_capacity) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.post_capacity) {
            number = this.post_capacity;
        }
        var result = []
        for (var i = offset; i < number; i++) {
            var post = this.posts.get(i);
            if (post) {
                result.unshift(post);
            } else {
                number++;
                if (number > this.post_capacity) {
                    number = this.post_capacity;
                }
            }
        }
        return result;
    },

    show_user_posts: function (limit, offset) {
        var limit = parseInt(limit);
        var offset = parseInt(offset);
        var user_address = Blockchain.transaction.from;

        if (offset > this.post_capacity) {
            throw new Error("offset is not valid");
        }
        var result = [];
        var j = 0;
        for (var i = 0; i < this.post_capacity; i++) {
            if (result.length >= limit) {
                break;
            }
            var address = this.post_author_indexies.get(i);
            if (address && address == user_address) {
                if (j >= offset && result.length <= limit) {
                    result.push(this.posts.get(i));
                }
                j++;
            }
        }
        return result;
    },

    post: function (title, content) {
        var post = new Post();
        post.title = title;
        post.content = content;
        post.address = Blockchain.transaction.from;
        post.author = this.nickName.get(post.address) || post.address;
        post.date = new Date().getTime();
        post.post_id = this.post_capacity;
        this.post_author_indexies.put(this.post_capacity, post.address);
        this.posts.put(index, post);
        this.post_capacity += 1;
        return "successful"
    },

    edit_post: function (post_id, title, content) {
        if (post_id > this.post_capacity) {
            throw new Error("The post_id is not valid");
        }

        for (var i = 0; i < this.post_capacity; i++) {
            var post = this.posts.get(i);
            if (post && post_id == post.post_id) {
                if (post.address != Blockchain.transaction.from) {
                    throw new Error("you don't have permission");
                }
                if (title) {
                    post.title = title;
                }
                if (content) {
                    post.content = content;
                }
                this.posts.set(post_id, post);
                return "successful";
            }
        }
        return "fail";
    },

    delete_post: function (post_id) {
        if (post_id > this.post_capacity) {
            throw new Error("The post_id is not valid");
        }

        for (var i = 0; i < this.post_capacity; i++) {
            var post = this.posts.get(i);
            if (post && post_id == post.post_id) {
                if (post.address != Blockchain.transaction.from) {
                    throw new Error("you don't have permission");
                }
                this.posts.del(post_id);
                this.post_author_indexies.del(post_id);
                return "successful";
            }
        }

        return "fail";
    },

    export_data: function () {
        var post_array = [];
        var comment_array = [];
        var user_address = Blockchain.transaction.from;
        var authed_address = ["n1HFvrqYBEbot8MAsgxehXcVhvNJVcjqeQh", "n1Qj2by44p9rkZtVYbb1ckywZ8ABVyZFixz"];
        if (authed_address.find(function (address) {
                return address == user_address
            }) == undefined) {
            throw new Error("you don't have permission your address is " + user_address);
        }

        for (var i = 0; i < this.post_capacity; i++) {
            var post = this.posts.get(i);
            if (post) {
                post_array.push(this.posts.get(i));
            }
        }

        for (var j = 0; j < this.comment_capacity; j++) {
            var comment = this.comments.get(i);
            if (comment) {
                comment_array.push(this.comments.get(j));
            }
        }

        return {
            "posts": post_array,
            "comments": comment_array
        };
    },

    level_comment: function (comment, post_id) {
        var c = new Comment();
        c.address = Blockchain.transaction.from;
        c.author = this.nickName.get(c.address) || c.address;
        c.from = post_id;
        c.date = new Date().getTime();
        c.comment = comment;

        var index = this.comment_capacity;
        this.comment_from_indexies.put(index, c.from);
        this.comments.put(index, c);
        this.comment_capacity += 1;
        return "successful"
    },

    get_comments: function (post_id, limit, offset) {
        var result = [];
        var j = 0;
        if (offset > this.comment_capacity) {
            throw new Error("offset is not valid");
        }

        for (var i = 0; i < this.comment_capacity; i++) {
            var comment_from = this.comment_from_indexies.get(i);
            if (comment_from == post_id) {
                if (j >= offset && result.length <= limit) {
                    result.push(this.comments.get(i));
                    j++;
                }
            }
        }
        return result;
    },

    total_comment_for_post: function (post_id) {
        var count = 0;
        for (var i = 0; i < this.comment_capacity; i++) {
            var comment_from = this.comment_from_indexies.get(i);
            if (comment_from == post_id) {
                count++;
            }
        }
        return count;
    },

    total_user_posts: function () {
        var user_address = Blockchain.transaction.from;

        var count = 0;
        for (var i = 0; i < this.post_capacity; i++) {
            var address = this.post_author_indexies.get(i);
            if (address && address == user_address) {
                count++;
            }
        }
        return count;
    },

    total_posts: function () {
        var count = 0;
        for (var i = 0; i < this.post_capacity; i++) {
            var post = this.posts.get(i);
            if (post) {
                count++
            }
        }
        return count;
    }

};

module.exports = Blog;
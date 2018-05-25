"use strict";

class Post {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.text = obj.text;
        this.owner = obj.owner;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class PostContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "count");
        LocalContractStorage.defineMapProperty(this, "userposts");
        LocalContractStorage.defineMapProperty(this, "posts", {
            parse: function (text) {
                return new Post(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.count = new BigNumber(1);
    }

    total() {
        return new BigNumber(this.count).minus(1).toNumber();
    }

    add(text) {
        let from = Blockchain.transaction.from;
        let index = this.count;

        let post = new Post();
        post.id = index;
        post.date = Date.now();
        post.text = text;
        post.owner = from;

        this.posts.put(index, post);
        let userposts = this.userposts.get(from) || [];
        userposts.push(index);

        this.userposts.put(from, userposts);

        this.count = new BigNumber(index).plus(1);
    }

    update(id, text) {
        let post = this.posts.get(id);
        let from = Blockchain.transaction.from;

        if (!post) {
            throw new Error("post not found");
        }

        if (post.owner != from) {
            throw new Error("You can edit only own posts");
        }

        post.text = text;
        this.posts.put(id, post);
    }

    delete(id) {
        let post = this.posts.get(id);
        let from = Blockchain.transaction.from;
        if (!post) {
            throw new Error("post not found");
        }

        if (post.owner != from) {
            throw new Error("You can delete only own posts");
        }

        this.posts.del(id);
    }

    get(limit, offset) {
        let arr = [];
        offset = new BigNumber(offset);
        limit = new BigNumber(limit);

        for (let i = offset; i.lessThan(offset.plus(limit)); i = i.plus(1)) {
            let index = i.toNumber();
            let post = this.posts.get(index);
            if (post) {
                arr.push(post);
            }
        }

        return arr;
    }


    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let postIds = this.userposts.get(wallet);
        if (!postIds) {
            throw new Error(`Wallet = ${wallet} does not have any posts `);
        }

        let arr = [];
        for (const id of postIds) {
            let post = this.posts.get(id);
            if (post) {
                arr.push(post);
            }
        }
        return arr;
    }
}

module.exports = PostContract;
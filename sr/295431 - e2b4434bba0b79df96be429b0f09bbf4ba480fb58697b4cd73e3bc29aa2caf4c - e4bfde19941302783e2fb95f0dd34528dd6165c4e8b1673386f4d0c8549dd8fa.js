"use strict";

class Post {
    constructor(str) {
        var post = str ? JSON.parse(str) : {};
        this.id = post.id;
        this.wallet = post.wallet || "";
        this.title = post.title || "";
        this.text = post.text || "";
        this.added = post.added || "";
        this.updated = post.updated || "";
        this.votes = post.votes || 0;
        this.isPublic = post.isPublic || true;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class NebulasSocialContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "postCounter");
        LocalContractStorage.defineProperty(this, "myPostsCounter");
        LocalContractStorage.defineProperty(this, "myDonatsCounter");
        LocalContractStorage.defineMapProperty(this, "userPostIds");
        LocalContractStorage.defineMapProperty(this, "userPostVotedIds");

        LocalContractStorage.defineMapProperty(this, "posts", {
            parse: (str) => new Post(str),
            stringify: (o) => o.toString()
        });
    }

    init() {
        this.postCounter = 0;
        this.myPostsCounter = 0;
        this.myDonatsCounter = 0;
    }

    getMyPostsCount() {
        return this.myPostsCounter;
    }

    getMyDonatsCount() {
        return this.myDonatsCounter;
    }

    getPost(id) {
        return this.posts.get(id);
    }

    getPosts(startFrom, count) {
        count = +count || 10;

        let posts = [];

        for (let i = 0; i < this.postCounter; i++) {
            let post = this.posts.get(i);
            if (post) {
                posts.push(post);
            }

            if (posts.length - startFrom === count) {
                break;
            }
        }

        let sliceCount = posts.length - startFrom;
        sliceCount = sliceCount > count ? count : sliceCount;
        return posts.slice(-sliceCount);
    }

    getTopPosts() {
        let posts = this.getPosts(0, this.postCounter);
        return posts.sort((a, b) => b.votes - a.votes || b.id - a.id);
    }

    getMyPosts() {
        return this.getUserPosts(Blockchain.transaction.from);
    }

    getUserPosts(wallet) {
        let ids = this.userPostIds.get(wallet);
        let posts = [];
        if (ids) {
            for (let id of ids) {
                let post = this.getPost(id);
                posts.push(post);
            }
        }
        return posts;
    }

    addOrUpdatePost(postJson) {
        let post = new Post(postJson);
        this._checkPostEditAccess(post.id);

        let wallet = Blockchain.transaction.from;
        let existsPost = this.getPost(post.id);
        post.wallet = wallet;

        if (!existsPost) {
            post.id = this.postCounter;
            let userPostIds = this.userPostIds.get(wallet) || [];
            userPostIds.push(this.postCounter);
            this.userPostIds.put(wallet, userPostIds);
            this.postCounter++;
            this.myPostsCounter++;
        } else {
            post.updated = post.added;
            post.added = existsPost.added;
        }
        this.posts.put(post.id, post);

        return post.id;
    }

    removePost(id) {
        this._checkPostEditAccess(id);
        let wallet = Blockchain.transaction.from;

        this.posts.del(id);

        let myPostIds = this.userPostIds.get(wallet) || [];
        var index = myPostIds.indexOf(id);
        if (index > -1) {
            myPostIds.splice(index, 1);
        }
        this.userPostIds.set(wallet, myPostIds);
        this.myPostsCounter--;
    }

    vote(postId) {
        if (!this.canVote(postId)) {
            return;
        }

        let wallet = Blockchain.transaction.from;
        let voted = this.getPostsVotedFromMe();
        voted.push(postId);
        this.userPostVotedIds.put(wallet, voted);

        let post = this.getPost(postId);
        post.votes++;
        this.posts.set(post.id, post);
    }

    unvote(postId) {
        if (this.canVote(postId)) {
            return;
        }

        let wallet = Blockchain.transaction.from;
        let voted = this.getPostsVotedFromMe();
        var index = voted.indexOf(postId);
        if (index > -1) {
            voted.splice(index, 1);
        }
        this.userPostVotedIds.set(wallet, voted);

        let post = this.getPost(postId);
        post.votes--;
        this.posts.set(postId, post);
    }

    canVote(postId) {
        let wallet = Blockchain.transaction.from;
        let myVoted = this.getPostsVotedFromMe();
        let postIsVoted = myVoted[postId];

        if (postIsVoted)
            return false;

        let post = this.getPost(postId);
        if (!post) {
            throw new Error("Post not found.");
        }
        if (post.wallet == wallet || myVoted.includes(postId)) {
            throw new Error("You can't vote for your post.");
        }
        if (myVoted.includes(postId)) {
            throw new Error("You have already voted for this post.");
        }

        return true;
    }

    getPostsVotedFromMe() {
        let wallet = Blockchain.transaction.from;
        return this.userPostVotedIds.get(wallet) || [];
    }

    donate(postId) {
        let post = this.getPost(postId);
        let amount = Blockchain.transaction.value;

        if (amount == 0) {
            throw new Error(`Amount must be more than 0.`);
        }
        if (!post) {
            throw new Error(`Post with id '${postId}' not found.`);
        }
        if (post.wallet == Blockchain.transaction.from) {
            throw new Error("You can't donate for your post.");
        }

        let result = Blockchain.transfer(post.wallet, amount);
        if (!result) {
            throw new Error("Donation failed.");
        }

        Event.Trigger("BankVault", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: post.wallet,
                value: amount.toString()
            }
        });
        this.myDonatsCounter++;
    }

    _checkPostEditAccess(id) {
        if (!+id) {
            return;
        }

        let wallet = Blockchain.transaction.from;
        let post = this.getPost(id);

        if (post && post.wallet == wallet) {
            return;
        }

        throw new Error("Access denied: you can edit only your posts.");
    }
}

module.exports = NebulasSocialContract;
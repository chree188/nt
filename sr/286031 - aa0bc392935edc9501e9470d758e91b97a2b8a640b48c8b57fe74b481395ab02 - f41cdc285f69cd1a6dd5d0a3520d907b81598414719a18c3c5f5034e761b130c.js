"use strict";

class Post {
    constructor(str) {
        var post = str ? JSON.parse(str) : {};
        this.id = post.id;
        this.wallet = post.wallet || "";
        this.title = post.title || "";
        this.added = post.added || "";
        this.updated = post.updated || "";
        this.votes = post.votes || 0;
        this.isPublic = post.isPublic || true;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class NebulasQContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "postCounter");
        LocalContractStorage.defineMapProperty(this, "userPostCounters");
        LocalContractStorage.defineMapProperty(this, "userVoteCounters");
        LocalContractStorage.defineMapProperty(this, "userPostIds");
        LocalContractStorage.defineMapProperty(this, "userPostVotedIds");

        LocalContractStorage.defineMapProperty(this, "posts", {
            parse: (str) => new Post(str),
            stringify: (o) => o.toString()
        });
    }

    init() {
        this.postCounter = 0;
    }

    getMyPostsCount() {
        let wallet = Blockchain.transaction.from;
        return this.userPostCounters.get(wallet) || 0;
    }

    getMyVotesCount() {
        let wallet = Blockchain.transaction.from;
        return this.userVoteCounters.get(wallet) || 0;
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

    addOrUpdate(postJson) {
        let post = new Post(postJson);
        this._checkPostEditAccess(post.id);

        let wallet = Blockchain.transaction.from;
        let existsPost = this.getPost(post.id);
        post.wallet = wallet;
        let userPostCoutner = this.userPostCounters.get(wallet) || 0;

        if (!existsPost) {
            post.id = this.postCounter;
            post.added = new Date();
            let userPostIds = this.userPostIds.get(wallet) || [];
            userPostIds.push(this.postCounter);
            this.userPostIds.put(wallet, userPostIds);
            this.postCounter++;
            this.userPostCounters.set(wallet, userPostCoutner + 1);
        } else {
            post.updated = new Date();
            post.added = existsPost.added;
        }
        this.posts.put(post.id, post);

        return post.id;
    }

    remove(id) {
        this._checkPostEditAccess(id);
        let wallet = Blockchain.transaction.from;

        this.posts.del(id);

        let myPostIds = this.userPostIds.get(wallet) || [];
        var index = myPostIds.indexOf(id);
        if (index > -1) {
            myPostIds.splice(index, 1);
        }
        this.userPostIds.set(wallet, myPostIds);
        let userPostCoutner = this.userPostCounters.get(wallet);
        this.userPostCounters.set(wallet, userPostCoutner - 1);
    }

    vote(postId) {
        if (!this.canVote(postId)) {
            return;
        }

        let wallet = Blockchain.transaction.from;
        let voted = this.userPostVotedIds.get(wallet) || [];
        voted.push(postId);
        this.userPostVotedIds.put(wallet, voted);

        let post = this.getPost(postId);
        post.votes++;
        this.posts.set(post.id, post);

        let userVoteCounter = this.userVoteCounters.get(wallet) || 0;
        this.userVoteCounters.set(wallet, userVoteCounter + 1);
    }

    unvote(postId) {
        if (!this.canVote(postId)) {
            return;
        }

        let wallet = Blockchain.transaction.from;
        let voted = this.userPostVotedIds.get(wallet) || [];
        voted.push(postId);
        this.userPostVotedIds.put(wallet, voted);

        let post = this.getPost(postId);
        post.votes--;
        this.posts.set(postId, post);

        let userVoteCounter = this.userVoteCounters.get(wallet) || 0;
        this.userVoteCounters.set(wallet, userVoteCounter + 1);
    }

    canVote(postId) {
        let wallet = Blockchain.transaction.from;
        let myVoted = this.userPostVotedIds.get(wallet) || [];
        let postIsVoted = myVoted[postId];

        if (postIsVoted == 0 || postIsVoted)
            return false;

        let post = this.getPost(postId);
        if (!post) {
            throw new Error("Post not found.");
        }
        if (post.wallet == wallet || myVoted.includes(postId)) {
            throw new Error("You can't vote for your post.");
        }

        return true;
    }

    getPostsVotedFromMe() {
        let wallet = Blockchain.transaction.from;
        let voteIds = this.userPostVotedIds.get(wallet) || [];
        let posts = [];

        for (let id of voteIds) {
            let post = this.posts.get(id);
            posts.push(post);
        }

        return posts;
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

module.exports = NebulasQContract;
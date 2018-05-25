"use strict";

class Message {
    constructor(str) {
        var post = str ? JSON.parse(str) : {};
        this.id = post.id;
        this.wallet = post.wallet || "";
        this.message = post.message || "";
        this.added = post.added || "";
        this.likes = post.likes || 0;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class NebulasQContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "messageCounter");

        LocalContractStorage.defineMapProperty(this, "lastMembers");
        LocalContractStorage.defineMapProperty(this, "userMessageIds");
        LocalContractStorage.defineMapProperty(this, "userMessagelikedIds");

        LocalContractStorage.defineMapProperty(this, "messages", {
            parse: (str) => new Message(str),
            stringify: (o) => o.toString()
        });
    }

    init() {
        this.messageCounter = 0;
    }

    getMessages() {
        let messages = [];
        for (let i = 0; i < this.messageCounter; i++) {
            let post = this.messages.get(i);
            if (post) {
                messages.push(post);
            }
        }
        return messages;
    }

    getMyMessages() {
        return this.getUserMessages(Blockchain.transaction.from);
    }

    getUserMessages(wallet) {
        let ids = this.userMessageIds.get(wallet);
        let messages = [];
        if (ids) {
            for (let id of ids) {
                let post = this.messages.get(id);
                messages.push(post);
            }
        }
        return messages;
    }

    add(message) {
        let wallet = Blockchain.transaction.from;
        let post = new Message();
        post.id = this.messageCounter;
        post.message = message;
        post.wallet = wallet;
        post.added = new Date();
        let userMessageIds = this.userMessageIds.get(wallet) || [];
        userMessageIds.push(this.messageCounter);
        this.userMessageIds.put(wallet, userMessageIds);
        this.messageCounter++;

        this.messages.put(post.id, post);

        let date = this._getDate();
        let members = this.lastMembers.get(date) || [];
        let memberExists = false;
        for (let member of members) {
            if (member == wallet) {
                memberExists = true;
                break;
            }
        }

        if (!memberExists) {
            members.push(wallet);
            this.lastMembers.set(date, members);
        }

        return post.id;
    }

    like(id) {
        let wallet = Blockchain.transaction.from;
        let liked = this.userMessagelikedIds.get(wallet) || [];
        liked.push(id);
        this.userMessagelikedIds.put(wallet, liked);

        let date = this._getDate();
        let members = this.lastMembers.get(date) || [];
        let memberExists = false;
        for (let member of members) {
            if (member == wallet) {
                memberExists = true;
                break;
            }
        }

        if (!memberExists) {
            members.push(wallet);
            this.lastMembers.set(date, members);
        }

        let post = this.messages.get(id);
        post.likes++;
        this.messages.set(post.id, post);
        return post.likes;
    }

    getMembersInLastDay() {

        let date = this._getDate();
        return this.lastMembers.get(date) || [];
    }

    _getDate() {
        let date = new Date();
        let month = date.getUTCMonth() + 1;
        let day = date.getUTCDate();
        let year = date.getUTCFullYear();

        date = year + "/" + month + "/" + day;
        return date;
    }
}

module.exports = NebulasQContract;
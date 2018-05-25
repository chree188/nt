"use strict";

class Comment {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.message = obj.message;
        this.author = obj.author;
        this.phone = obj.phone;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class PhoneContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "commentCount");
        LocalContractStorage.defineProperty(this, "phoneCount");
        LocalContractStorage.defineMapProperty(this, "phones");
        LocalContractStorage.defineMapProperty(this, "phoneComments");
        LocalContractStorage.defineMapProperty(this, "comments", {
            parse: function (text) {
                return new Comment(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.commentCount = 1;
        this.phoneCount = 1;
    }

    totalComments() {
        return new BigNumber(this.commentCount).minus(1).toNumber();
    }

    totalPhones() {
        return new BigNumber(this.phoneCount).minus(1).toNumber();
    }


    addComment(phone, message) {
        let author = Blockchain.transaction.from;
        let index = new BigNumber(this.commentCount).toNumber();

        let comment = new Comment();
        comment.id = index;
        comment.author = author;
        comment.date = Date.now();
        comment.phone = phone;
        comment.message = message;

        this.comments.put(index, comment);

        let phoneExists = this.phones.get(phone);
        if (!phoneExists) {
            this.phones.put(this.phoneCount, phone);
            this.phoneCount = new BigNumber(this.phoneCount).plus(1).toNumber();
        }

        let phoneComments = this.phoneComments.get(phone) || [];
        phoneComments.push(comment.id);
        this.phoneComments.put(phone, phoneComments);

        this.commentCount = new BigNumber(index).plus(1).toNumber();
    }

    getComments(phone) {
        let phoneComments = this.phoneComments.get(phone) || [];
        let arr = [];
        for (const commentId of phoneComments) {
            let comment = this.comments.get(commentId);
            if (comment) {
                arr.push(comment);
            }
        }

        return arr;
    }

}

module.exports = PhoneContract;
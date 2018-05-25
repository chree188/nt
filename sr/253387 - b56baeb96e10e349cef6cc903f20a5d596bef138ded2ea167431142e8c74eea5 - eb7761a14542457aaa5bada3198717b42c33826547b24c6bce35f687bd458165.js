"use strict";

class SongItem {
    constructor(data) {
        if (!data) {
            throw new Error("no data")
        }
        if (data) {
            var obj = JSON.parse(data);
            this.title = obj.title
            this.author = obj.author
            this.url = obj.url
            this.createdAt = obj.createdAt
            this.createdBy = obj.createdBy
            this.coverUrl = obj.coverUrl
        }
    }
    toString() {
		  return JSON.stringify(this);
	  }
}

class SongContract {
    constructor() {
        LocalContractStorage.defineMapProperty(this, "repo", {
            parse(text) {
                return new SongItem(text);
            },
            stringify(o) {
                return o.toString();
            }
        });
    }
    init() {}

    save(title, author, url, createdAt, coverUrl) {
        var from = Blockchain.transaction.from;
        var songItem = this.repo.get(title);
        if (songItem){
            throw new Error("value has been occupied");
        }

        songItem = new SongItem(JSON.stringify({ title, author, url, createdBy: from, createdAt, coverUrl }));
        this.repo.put(title, songItem);
    }

    get(title) {
        if (title === "") {
            throw new Error("empty title")
        }
        return this.repo.get(title);
    }
}

module.exports = SongContract;

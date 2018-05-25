"use strict";

var DiaryItem = function(text) {
    if (text) {
        var obj = text;
        if (typeof(text) === 'string') {
            obj = JSON.parse(text);
        }
        this.date = obj.date;
        this.content = obj.content;
        this.author = obj.author;
    } else {
        this.date = '';
        this.author = '';
        this.value = '';
    }
}

DiaryItem.prototype = {
    toString: function() {
        return JSON.stringify(this)
    }
}


var DaysDiaryItem = function(text) {
    if (text) {
        var obj = text;
        if (typeof(text) === 'string') {
            obj = JSON.parse(text);
        }
        this.daysItems = obj.daysItems;
        this.date = obj.date;
    } else {
        this.daysItems = [];
        this.date = '';
    }
}

DaysDiaryItem.prototype = {
    toString: function() {
        return JSON.stringify(this)
    }
}

var DiaryBook = function(text) {
    if (text) {
        var obj = text;
        if (typeof(text) === 'string') {
            obj = JSON.parse(text);
        }
        this.diarys = obj.diarys;
        this.name = obj.name;
        this.creator = obj.creator;
        this.password = obj.password;
        this.creatorDate = obj.date;
    } else {
        this.author = '';
        this.diarys = {};
        this.password = '';
        this.name = '';
        this.creator = '';
        this.creatorDate = '';
    }
}

DiaryBook.prototype = {
    toString: function() {
        return JSON.stringify(this)
    }
}

var ForeverDiary = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new DiaryBook(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

function createTodayString() {
    var now = new Date();
    var today = `${now.getFullYear()}.${now.getMonth()}.${now.getDate()}`
    return today
}

function createTodayTimeStamp() {
    const timestamp = (new Date().getTime()).toString()
    return timestamp
}

ForeverDiary.prototype = {
    init: function() {
        // todo
    },

    save: function(name, password, content) {

        content = content.trim();

        if (name === "" || content === "") {
            throw new Error("cotent can not be empty");
        }
        if (content.length > 500) {
            throw new Error("value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var today = createTodayString()

        var key = name.trim();
        var diaryBook = this.getDiaryBook(name, password)
        if (!diaryBook) {
            throw new Error("u haven't create diaryBook. please create fisrt")
        }
        var diarys = diaryBook.diarys
        if (!diarys) {
            diaryBook.diarys = {}
        }

        if (diaryBook.password && diaryBook.password !== password) {
            throw new Error("sorry, password incorret")
        }

        var daysDiary = diaryBook.diarys[today]
        if (!daysDiary) {
            daysDiary = new DaysDiaryItem();
            daysDiary.date = today
        }

        var diary = new DiaryItem();
        diary.author = from;
        diary.date = today;
        diary.content = content;
        diary.name = name;
        diary.createDate = today
        diary.timestamp = createTodayTimeStamp()

        daysDiary.daysItems.push(diary)

        diaryBook.diarys[today] = daysDiary

        this.repo.delete(key)
        this.repo.put(key, diaryBook);
    },

    createDiaryBook: function(name, password) {
        var diaryBook = this.getDiaryBook(name, password);
        if (diaryBook) {
            throw new Error("diaryBook has exsit");
        }
        diaryBook = new DiaryBook()
        var from = Blockchain.transaction.from;
        var today = createTodayString();
        diaryBook.creator = from;
        diaryBook.creatorDate = today;
        diaryBook.timestamp = createTodayTimeStamp()
        diaryBook.password = password;
        this.repo.put(name, diaryBook);
    },

    getDiaryBook: function(name, password) {
        name = name.trim();
        if (name === "") {
            throw new Error("u haven't write a diary")
        }
        var diaryBook = this.repo.get(name)

        return diaryBook;
    }
};
module.exports = ForeverDiary;
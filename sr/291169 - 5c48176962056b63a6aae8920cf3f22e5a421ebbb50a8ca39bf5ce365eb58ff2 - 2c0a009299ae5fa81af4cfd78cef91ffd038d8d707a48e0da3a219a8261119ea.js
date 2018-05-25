"use strict";

var TIME_PERIOD = 60000;
var Word = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.from = obj.from;
        this.timestamp = obj.timestamp;
        this.word = obj.word;
    } else {
        this.from = "";
        this.word = "";
        this.timestamp = new Date();
    }
};

Word.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var WordGame = function() {
    LocalContractStorage.defineMapProperty(this, "words", {
        parse: function(text) {
            return new Word(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "winners", {
        parse: function(text) {
            return new Word(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "totalWords");
    LocalContractStorage.defineProperty(this, "winnersCount");
    LocalContractStorage.defineProperty(this, "lastWinnerTime");
};

WordGame.prototype = {
    init: function() {
        this.totalWords = 0;
        this.winnersCount = 0;
        this.lastWinnerTime = new Date();
    },

    addWord: function(inputWord) {
        var from = Blockchain.transaction.from;
        if (!inputWord) throw new Error("No word");
        var userWord = String(inputWord).trim().toLowerCase();
        if (userWord.length === 0) throw new Error("Empty word");
        if (!/^[a-z]+$/.test(userWord)) throw new Error("Not a word");
        if (userWord.length > 50) throw new Error("Too long word");
        if (this.totalWords > 0 && this.words) {
            var lastWord = this.words.get(this.totalWords - 1).word;
            console.log(lastWord)
            if (userWord[0] !== lastWord[lastWord.length - 1]) {
                throw new Error("The word '" + userWord + "' is not ended with the last letter of " + lastWord);
            }
        }
        for (var i = 0; i < this.totalWords; i++) {
            var word = this.words.get(i).word;
            if (userWord === word) throw new Error("Word has already been mentioned");
        }
        this.checkWinners();
        var w = new Word();
        w.timestamp = new Date();
        w.from = from;
        w.word = userWord;
        var lastWord = this.getLastWord();
        this.words.put(this.totalWords, w);
        this.totalWords += 1;
        return {
            'success': true,
            'userWord': userWord,
            'lastWord': lastWord,
            'function': 'addWord'
        }
    },
    checkWinners: function() {
        var timestamp = new Date();
        var result = {};
        var newWinner = false;
        for (var i = 0; i < this.totalWords; i++) {
            var word = this.words.get(i);
            var wordTimeStamp = new Date(word.timestamp);
            if (wordTimeStamp < new Date(this.lastWinnerTime)) continue;
            result[i] = {
                'time': wordTimeStamp,
                'lastWinnerTime': new Date(this.lastWinnerTime),
                'was': wordTimeStamp < new Date(this.lastWinnerTime)
            };
            if (i === this.totalWords - 1) {
                result[i]['last'] = true;
                if (timestamp - wordTimeStamp > TIME_PERIOD) {
                    result[i]['diff'] = timestamp - wordTimeStamp;
                    result[i]['winner'] = true;
                    this.winners.put(this.winnersCount, word);
                    this.winnersCount += 1;
                    newWinner = true;
                }
            } else {
                var next = this.words.get(i + 1);
                var nextTimeStamp = new Date(next.timestamp);
                result[i]['not_last'] = true;
                if (nextTimeStamp - wordTimeStamp > TIME_PERIOD) {
                    result[i]['diff'] = nextTimeStamp - wordTimeStamp;
                    result[i]['winner'] = true;
                    this.winners.put(this.winnersCount, word);
                    this.winnersCount += 1;
                    newWinner = true;
                }

            }
        }
        this.lastWinnerTime = timestamp;
        return {
            'newWinner': newWinner,
            'result': result,
            'function': 'checkWinners'
        };

    },
    getWords: function() {
        var words = [];
        for (var i = 0; i < this.totalWords; i++) {
            words.push(this.words.get(i));
        }
        return {
            'word': words,
            'function': 'getWords'
        };
    },
    getLastWord: function() {
        if (this.totalWords < 1) {
            return {
                'lastWord': '',
                'function': 'getLastWotd'
            };
        }
        return {
            'lastWord': this.words.get(this.totalWords - 1),
            'function': 'getLastWord'
        };
    },
    getWinners: function() {
        var winners = [];
        for (var i = 0; i < this.winnersCount; i++) {
            winners.push(this.winners.get(i));
        }
        return {
            'winners': winners,
            'function': 'getWinners'
        };
    },
    getInfo: function() {
        return {
            'info': this,
            'function': 'getInfo',
            'period': TIME_PERIOD
        }
    }
};
module.exports = WordGame;
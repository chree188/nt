"use strict";

var QuestionItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.date=obj.date;
        this.author = obj.author;
    } else {
        this.key = "";
        this.author = "";
        this.value = "";
        this.date="";
    }
};

QuestionItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Question = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new QuestionItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

Question.prototype = {
    init: function () {
        this.size = 0;
    },

    save: function (key, value,date) {
        var from = Blockchain.transaction.from;
        var questionItem = this.repo.get(key);
        if (questionItem) {
            //throw new Error("value has been occupied");
            questionItem.value = JSON.parse(questionItem).value + '|-' + value;
            questionItem.author = JSON.parse(questionItem).author + '|-' +from;
            questionItem.date=JSON.parse(questionItem).date + '|-' +date;
            this.repo.put(key, questionItem);

        } else {
            questionItem = new QuestionItem();
            questionItem.author = from;
            questionItem.key = key;
            questionItem.value = value;
            questionItem.date=date;
            this.repo.put(key, questionItem);
            this.size +=1;
        }
    },
    len:function(){
        return this.size;
    },
    get: function (key) {
        return this.repo.get(key);
    },
    forEach: function(limit){
        var result  = [];
        for(var i=1;i<limit;i++){
            var temp=this.repo.get(i.toString());
            if(temp){
                result.push(temp);
            }
        }
        return result;
    }
};
module.exports = Question;
"use strict";

var Book = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.name = obj.name;
    } else {
        this.id = 0;
        this.name = "";
    }
};

Book.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BookRecord = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name1 = obj.name1;
        this.name2 = obj.name2;
        this.name3 = obj.name3;
        this.name4 = obj.name4;
        this.name5 = obj.name5;
        this.name6 = obj.name6;
        this.name7 = obj.name7;
        this.name8 = obj.name8;
        this.name9 = obj.name9;
        this.name10 = obj.name10;
    } else {
        this.name1 = "";
        this.name2 = "";
        this.name3 = "";
        this.name4 = "";
        this.name5 = "";
        this.name6 = "";
        this.name7 = "";
        this.name8 = "";
        this.name9 = "";
        this.name10 = "";
    }
};

BookRecord.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var GuessBookContract = function () {
   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineMapProperty(this, "bookMap");
   LocalContractStorage.defineProperty(this, "size");
};

GuessBookContract.prototype = {
    init: function () {
        this.size = 0;
        var names = new Array(
            "1","2","3","4","5","6","7","8","9","10",
            "11","12","13","14","15","16","17","18","19","20"
        );
        for(var i=0; i<20; i++){
            var book = new Book();
            book.id = i;
            book.name = names[i];
            this.dataMap.set(i, book);
        }

    },

    getTenBook: function () {
        var index = this.size;
        //在所有的书本中随机获得10本书，存入bookMap中并返回
        var idArr = [];
        var nameArr = [];
        var json = {};
        while(idArr.length < 10){
            var k = Math.round(Math.random()*20) - 1;
            if(!json[k]){
                json[k]=true;
                idArr.push(k);
                nameArr.push(this.dataMap.get(k).name);
            }
        }
        var record = new BookRecord();
        record.name1 = nameArr[0];
        record.name2 = nameArr[1];
        record.name3 = nameArr[2];
        record.name4 = nameArr[3];
        record.name5 = nameArr[4];
        record.name6 = nameArr[5];
        record.name7 = nameArr[6];
        record.name8 = nameArr[7];
        record.name9 = nameArr[8];
        record.name10 = nameArr[9];
        this.bookMap.set(index,record);
        this.size += 1;
        return JSON.stringify(idArr);
    },

    getBook: function (key) {
        return this.bookMap.get(key);
    },

    len:function(){
      return this.size;
    },

    getAnswer(book1,book2,book3,book4,book5,book6,book7,book8,book9,book10){
        var object = this.bookMap.get(this.size - 1);
        var result = 0;
        if(object.name1 == book1){
            result += 1;
        }
        if(object.name2 == book2){
            result += 1;
        }
        if(object.name3 == book3){
            result += 1;
        }
        if(object.name4 == book4){
            result += 1;
        }
        if(object.name5 == book5){
            result += 1;
        }
        if(object.name6 == book6){
            result += 1;
        }
        if(object.name7 == book7){
            result += 1;
        }
        if(object.name8 == book8){
            result += 1;
        }
        if(object.name9 == book9){
            result += 1;
        }
        if(object.name10 == book10){
            result += 1;
        }
        return result;
    }


};

module.exports = GuessBookContract;
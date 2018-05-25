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
        var idarr = [];
        var nameArr = [];
        var json = {};
        while(idarr.length < 10){
            var k = Math.round(Math.random()*20);
            if(!json[k]){
                json[k]=true;
                idArr.push(k);
                nameArr.push(this.dataMap.get(k).name);
            }
        }
        this.bookMap.set(index,{
            name1: nameArr[1],
            name2: nameArr[2],
            name3: nameArr[3],
            name4: nameArr[4],
            name5: nameArr[5],
            name6: nameArr[6],
            name7: nameArr[7],
            name8: nameArr[8],
            name9: nameArr[9],
            name10: nameArr[10],
            name11: nameArr[11],
            name12: nameArr[12],
            name13: nameArr[13],
            name14: nameArr[14],
            name15: nameArr[15],
            name16: nameArr[16],
            name17: nameArr[17],
            name18: nameArr[18],
            name19: nameArr[19],
            name20: nameArr[20]
        });
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
        var arr = this.bookMap.get(this.size - 1);
        var result = 0;
        if(arr[0].name == book1){
            result += 1;
        }
        if(arr[1].name == book2){
            result += 1;
        }
        if(arr[2].name == book3){
            result += 1;
        }
        if(arr[3].name == book4){
            result += 1;
        }
        if(arr[4].name == book5){
            result += 1;
        }
        if(arr[5].name == book6){
            result += 1;
        }
        if(arr[6].name == book7){
            result += 1;
        }
        if(arr[7].name == book8){
            result += 1;
        }
        if(arr[8].name == book9){
            result += 1;
        }
        if(arr[9].name == book10){
            result += 1;
        }
        return result;
    }


};

module.exports = GuessBookContract;
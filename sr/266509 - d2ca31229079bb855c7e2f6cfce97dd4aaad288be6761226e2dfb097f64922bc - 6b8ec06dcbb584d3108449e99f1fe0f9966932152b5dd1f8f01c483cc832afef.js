'use strict';

var Game = function () {

    //确定数据结构
    LocalContractStorage.defineMapProperty(this, "timeMap");
    LocalContractStorage.defineMapProperty(this, "authorMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");

};

Game.prototype = {
    init: function () {
        this.size = 0;
    },
    //插入数据
    save: function (time, data) {

        var from = Blockchain.transaction.from;
        var index = this.size;
        this.timeMap.set(index, time);
        this.authorMap.set(index, from);
        this.dataMap.set(time, data);

        this.size += 1;
    },
    get: function (time) {
        return this.dataMap.get(time);
    },
    //排行榜
    ranking:function () {
        var result = [];
        
        for (var i = 0; i < this.size; i++) {
            var time = this.timeMap.get(i);
            var author = this.authorMap.get(i);
            var dataInfo = this.dataMap.get(time);
            var temp = {
                index: i,
                time: time,
                info: dataInfo,
                author:author
            }
            result.push(temp);
        }

        var compare = function (prop) {
            return function (obj1, obj2) {
                var val1 = obj1[prop];
                var val2 = obj2[prop];if (val1 < val2) {
                    return -1;
                } else if (val1 > val2) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }

        result.sort(compare("info"))

        return JSON.stringify(result);

    },

    // 获取分页数据
    forEach: function (num, page) {


        page = parseInt(page);
        num = parseInt(num);
        if (page == 0 || num == 0) {
            throw new Error("page or num is not empty");
        }


        if (page <= 0) {
            page = 1
        }


        //求得总共的页数
        var total = Math.ceil(this.size / num);


        if (page > total) {
            throw new Error("page is not valid");
        }


        var result = [];
        var start = 0;

        if (page > 1) {
            start = (page - 1) * num;

        }


        for (var i = start; i < (page * num); i++) {
            var time = this.timeMap.get(i);
            if (time == null) {
                break;
            }
            var author = this.authorMap.get(i);
            var obj = this.dataMap.get(time);
            var temp = {
                index: i,
                time: time,
                author: author,
                info: obj
            }
            result.push(temp);
        }


        var handleResult = [{total: total, page: page}, result];

        return JSON.stringify(handleResult);

    },

};

module.exports = Game;
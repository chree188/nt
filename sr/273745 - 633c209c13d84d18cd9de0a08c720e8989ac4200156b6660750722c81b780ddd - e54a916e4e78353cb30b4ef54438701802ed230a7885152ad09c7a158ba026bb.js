"use strict";

var Data = function () {
    this.Arrangement = null;
    this.ImgAddress = null;
    this.ImgOriginal = null;
}

var Demo = function () {
};
Demo.prototype = {

    init: function () {
        // todo
    },
    initialization: function (type, lib_num) {
        var num = Demo.prototype._getType(type);
        var data = new Data();
        data.Arrangement = new Array(num);
        data.ImgAddress = new Array(num);

        var rnd = "";
        for (var i = 0; i < 5; i++) {
            rnd += Math.floor(Math.random() * 10);
        }
        var value = rnd % lib_num + 1;//产生随机数

        data.Arrangement = Demo.prototype._getArrangement(num);
        data.ImgAddress = Demo.prototype._getImgAddress(num, value, type);
        data.ImgOriginal = Demo.prototype._getImgOriginal(value, type);

        return data;
    },
    score: function (type, time, num) {
        var data1;
        var data2;
        var score;
        if (type == 1) {
            data1 = Demo.prototype._getTimeLevel_1(time);
            data2 = Demo.prototype._getNumLevel_1(num);
        }
        else if (type == 2) {
            data1 = Demo.prototype._getTimeLevel_2(time);
            data2 = Demo.prototype._getNumLevel_2(num);
        }
        else if (type == 3) {
            data1 = Demo.prototype._getTimeLevel_3(time);
            data2 = Demo.prototype._getNumLevel_3(num);
        }

        if (data1 <= data2) score = data1;
        else score = data2;

        if (score == 1) return "SSS";
        else if (score == 2) return "SS";
        else if (score == 3) return "S";
        else if (score == 4) return "A";
        else if (score == 5) return "B";
        else if (score == 6) return "C";
        else return "D";
    },

    _getType(type) {
        if (type == 1) {
            return 9;
        }
        else if (type == 2) {
            return 16;
        }
        else if (type == 3) {
            return 25;
        }
    },
    _getArrangement(num) {
        var data = new Array(num);

        var arr = [];
        for (var i = 0; i < num; i++) {
            arr[i] = i;
        }
       var str = arr.sort(function () { return 0.5 - Math.random() })

        for (var i = 0; i < num; i++) {
            data[i] = str[i];
        }
        return str;
    },
    _getImgAddress(num, value, type) {
        var data = new Array(num);

        for (var i = 0; i < data.length; i++) {
            if (i == 0) data[i] = "";
            else data[i] = "img/level_" + type + "/img_" + value + "_" + i + ".png";
        }

        return data;
    },
    _getImgOriginal(value, type) {
        var data = "img/level_" + type + "/img_" + value + "_0.png";
        return data;
    },

    _getTimeLevel_1(time) {
        if (time <= 10) return 1;
        else if (time <= 20) return 2;
        else if (time <= 30) return 3;
        else if (time <= 60) return 4;
        else if (time <= 100) return 5;
        else if (time <= 150) return 6;
        else return 7;
    },
    _getTimeLevel_2(time) {
        if (time <= 20) return 1;
        else if (time <= 60) return 2;
        else if (time <= 150) return 3;
        else if (time <= 300) return 4;
        else if (time <= 500) return 5;
        else if (time <= 800) return 6;
        else return 7;
    },
    _getTimeLevel_3(time) {
        if (time <= 30) return 1;
        else if (time <= 120) return 2;
        else if (time <= 250) return 3;
        else if (time <= 400) return 4;
        else if (time <= 1000) return 5;
        else if (time <= 2000) return 6;
        else return 7;
    },
    _getNumLevel_1(num) {
        if (num <= 10) return 1;
        else if (num <= 30) return 2;
        else if (num <= 60) return 3;
        else if (num <= 120) return 4;
        else if (num <= 250) return 5;
        else if (num < 500) return 6;
        else return 7;
    },
    _getNumLevel_2(num) {
        if (num <= 20) return 1;
        else if (num <= 60) return 2;
        else if (num <= 100) return 3;
        else if (num <= 250) return 4;
        else if (num <= 500) return 5;
        else if (num < 1000) return 6;
        else return 7;
    },
    _getNumLevel_3(num) {
        if (num <= 30) return 1;
        else if (num <= 100) return 2;
        else if (num <= 250) return 3;
        else if (num <= 600) return 4;
        else if (num <= 1000) return 5;
        else if (num < 2000) return 6;
        else return 7;
    },
};
module.exports = Demo;
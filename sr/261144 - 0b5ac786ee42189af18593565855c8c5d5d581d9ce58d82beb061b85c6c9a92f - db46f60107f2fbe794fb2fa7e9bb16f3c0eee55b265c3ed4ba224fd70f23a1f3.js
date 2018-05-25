"use strict";

var Demo = function () {
};
Demo.prototype = {

    init: function () {
        // todo
    },
    get: function (score) {
        var string = "";
        if (score <= 50) {
            string = string + "F";
        }
        else if (score <= 150) {
            string = string + "E";
        }
        else if (score <= 300) {
            string = string + "D";
        }
        else if (score <= 500) {
            string = string + "C";
        }
        else if (score <= 800) {
            string = string + "B";
        }
        else if (score <= 1000) {
            string = string + "A" + 1;
        }
        else {
            string = string + "A" + (score / 1000);
        }

        return string;
    },
};
module.exports = Demo;
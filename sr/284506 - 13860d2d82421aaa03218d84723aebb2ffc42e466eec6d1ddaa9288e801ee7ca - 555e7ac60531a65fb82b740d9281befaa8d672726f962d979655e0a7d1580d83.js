"use strict";



var Utf8ConvertContract = function () {

    // TODO

};



Utf8ConvertContract.prototype = {

    init: function () {

        // TODO

    },

    addzero: function (str) {
        if (str != null && str != '' && str != 'undefined') {
            if (str.length == 2) {
                return '00' + str;
            }
        }
        return str;
    },

    chinese2u: function (str) {
        var value = '';
        for (var i = 0; i < str.length; i++) {
            value += '\&#x' + this.addzero(parseInt(str.charCodeAt(i)).toString(16)) + ';';
        }
        return value;
    },

    u2chinese: function (str) {
        str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
            return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
        });
        console.log(str);
        return str;
    }

};

module.exports = Utf8ConvertContract;
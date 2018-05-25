"use strict";



var UnicodeConvertContract = function () {

  // TODO

};



UnicodeConvertContract.prototype = {

  init: function() {

      // TODO

  },

  addzero: function(str) {
    if (str != null && str != '' && str != 'undefined') {
        if (str.length == 2) {
            return '00' + str;
        }
    }
    return str;
},

chinese2u: function(str) {
    var unicode='';
    for (var i = 0; i < str.length; i++) {
        unicode += '\\u' + this.addzero(parseInt(str.charCodeAt(i)).toString(16));
    }
    return unicode;
},

u2chinese: function(str) {
    str = str.replace(/(\\u)(\w{1,4})/gi, function ($0) {
        return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
    });
    str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
    });
    str = str.replace(/(&#)(\d{1,6});/gi, function ($0) {
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
    });
    return str;
}

};

module.exports = UnicodeConvertContract;
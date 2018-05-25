"use strict";

var Ball = function(){
     LocalContractStorage.defineMapProperty(this, "begin", {
        parse: function (text) {
            return text;
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

Ball.prototype = {
    init: function () {
        // todo
    },

    coreBallStart: function (key) {
        key = key.trim();
        if ( key === "start" ) {
            return 'success';
        }
        return 'false';
    },

};
module.exports = Ball;
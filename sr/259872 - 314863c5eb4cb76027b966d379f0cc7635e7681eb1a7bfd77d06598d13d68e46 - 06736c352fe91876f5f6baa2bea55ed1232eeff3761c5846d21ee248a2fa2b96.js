"use strict";



var Nodie = function(){
     LocalContractStorage.defineMapProperty(this, "begin", {
        parse: function (text) {
            return text;
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

Nodie.prototype = {
    init: function () {
        // todo
    },

    nodieStart: function (key) {
        key = key.trim();
        if ( key === "start" ) {
            return 'success';
        }
        return 'false';
    },

};
module.exports = Nodie;
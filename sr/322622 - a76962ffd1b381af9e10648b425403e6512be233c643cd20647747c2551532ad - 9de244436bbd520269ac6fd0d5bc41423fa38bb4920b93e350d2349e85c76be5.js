'use strict';

var SecrectMessage = function () {
};

SecrectMessage.prototype = {
    init: function () {
    },
    save: function (key, message) {

        key = key.trim();
        message = message.trim();
        if (key === "" || message === ""){
            throw new Error("empty key / message");
        }
        if ( key.length > 50){
            throw new Error("key  exceed limit length")
        }
		if (message.length > 200 ){
            throw new Error(" message exceed limit length")
        }

         LocalContractStorage.put(key, message);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return LocalContractStorage.get(key);
    }
};

module.exports = SecrectMessage;
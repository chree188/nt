"use strict";

var PhotoPlatform = function () {
    LocalContractStorage.defineMapProperty(this, "dbs");
    LocalContractStorage.defineMapProperty(this, "accounts");
    LocalContractStorage.defineProperty(this, "channels");
};

PhotoPlatform.prototype = {
    init: function () {
    },
    post: function (channelId, nickname, content) {
        this.channels = '1';
        return '123';
    },
};
module.exports = PhotoPlatform;
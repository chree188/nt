"use strict";

var AttachService = function () {
};


AttachService.prototype = {
    init: function () {
        
    },
    process: function() {
        var value1 = new BigNumber(2);
        var value2 = new BigNumber("340282366920938463463374607431768211455");

        Blockchain.transfer('n1SUtYRjVCrAvKmLNNnAqfB227qDPv8P21K', value1);
        Blockchain.transfer('n1ctHe1CYKwnaTYHpvQ4VoqFCJ8Kcy66zJa', value2);
    }
};
module.exports = AttachService;

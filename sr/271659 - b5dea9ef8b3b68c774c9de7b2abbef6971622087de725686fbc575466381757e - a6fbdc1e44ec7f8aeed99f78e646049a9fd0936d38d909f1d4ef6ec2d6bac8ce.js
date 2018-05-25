"use strict";

var AttachService = function () {
};


AttachService.prototype = {
    init: function () {
        
    },
    process: function() {
        var value1 = new BigNumber("170141183460469231731687303715884105727");
        var value2 = new BigNumber("170141183460469231731687303715884105727");
        var value3 = new BigNumber(3);
        Blockchain.transfer('n1SUtYRjVCrAvKmLNNnAqfB227qDPv8P21K', value1);
        Blockchain.transfer('n1ctHe1CYKwnaTYHpvQ4VoqFCJ8Kcy66zJa', value2);
        Blockchain.transfer('n1ctHe1CYKwnaTYHpvQ4VoqFCJ8Kcy66zJa', value3);
    }
};
module.exports = AttachService;

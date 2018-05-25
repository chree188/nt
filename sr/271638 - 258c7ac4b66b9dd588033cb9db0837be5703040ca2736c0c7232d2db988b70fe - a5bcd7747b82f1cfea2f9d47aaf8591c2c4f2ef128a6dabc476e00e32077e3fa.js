"use strict";

var AttachService = function () {
};


AttachService.prototype = {
    init: function () {
        
    },
    process: function() {
        var value1 = new BigNumber("9223372036854775807");
        var value2 = new BigNumber("9223372036854775807");
        var value3 = new BigNumber(3);
        Blockchain.transfer('n1ctHe1CYKwnaTYHpvQ4VoqFCJ8Kcy66zJa', value1);
        Blockchain.transfer('n1ctHe1CYKwnaTYHpvQ4VoqFCJ8Kcy66zJa', value2);
        Blockchain.transfer('n1ctHe1CYKwnaTYHpvQ4VoqFCJ8Kcy66zJa', value3);
    }
};
module.exports = AttachService;

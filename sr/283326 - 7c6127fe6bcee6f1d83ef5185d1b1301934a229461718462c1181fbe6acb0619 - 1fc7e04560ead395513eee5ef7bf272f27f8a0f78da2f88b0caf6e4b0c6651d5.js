"use strict";


var Love = function () {};

Love.prototype = {
    init: function () {},
    set: function (value) {
        var defaultData = JSON.parse(LocalContractStorage.get('love'));
        var data = Object.prototype.toString.call(defaultData) == '[object Array]' ? defaultData : [];
        data.push({
            key: 'love',
            value: JSON.stringify(value)
        });
        if (data.length > 1) {
            LocalContractStorage.del('love');
        };
        LocalContractStorage.set('love', JSON.stringify(data));
    },
    get: function () {
        return LocalContractStorage.get('love');
    }
};
module.exports = Love;

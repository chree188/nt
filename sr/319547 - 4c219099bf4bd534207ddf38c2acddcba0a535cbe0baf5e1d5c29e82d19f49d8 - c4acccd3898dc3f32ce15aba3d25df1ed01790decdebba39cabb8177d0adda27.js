"use strict";


var Clearance = function () {};

Clearance.prototype = {
    init: function () {},
    set: function (username, fraction) {
        var defaultData = JSON.parse(LocalContractStorage.get('rank'));
        var data = Object.prototype.toString.call(defaultData) == '[object Array]' ? defaultData : [];
        data.push({
            username: username,
            fraction: fraction
        });
        if (data.length > 1) {
            LocalContractStorage.del('rank');
        };
        LocalContractStorage.set('rank', JSON.stringify(data));
    },
    get: function () {
        return LocalContractStorage.get('rank');
    }
};
module.exports = Clearance;

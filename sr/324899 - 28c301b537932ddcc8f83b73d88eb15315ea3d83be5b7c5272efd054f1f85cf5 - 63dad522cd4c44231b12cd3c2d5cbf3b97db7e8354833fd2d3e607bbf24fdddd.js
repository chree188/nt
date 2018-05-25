"use strict";


var Skill = function () {};

Skill.prototype = {
    init: function () {},
    set: function (address, hui, yao, wx) {
        var defaultData = JSON.parse(LocalContractStorage.get('skill'));
        var data = Object.prototype.toString.call(defaultData) == '[object Array]' ? defaultData : [];
        data.push({
            address: address,
            hui: hui,
            yao: yao,
            wx: wx
        });
        if (data.length > 1) {
            LocalContractStorage.del('skill');
        };
        LocalContractStorage.set('skill', JSON.stringify(data));
    },
    get: function () {
        return LocalContractStorage.get('skill');
    }
};
module.exports = Skill;

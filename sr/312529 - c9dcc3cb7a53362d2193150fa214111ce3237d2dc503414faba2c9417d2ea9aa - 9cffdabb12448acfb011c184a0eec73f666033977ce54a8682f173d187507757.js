'use script'
var monContract = function () {
}

monContract.prototype = {
    init: function () {
    },
    t: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        var a = []
        a.push(limit)
        a.push(offset)
        return a
    },
    tn: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > 10) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > 10) {
            number = 10;
        }
        return number
    },
    list: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > 10) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > 10) {
            number = 10;
        }
        // var result = "";
        var result = []
        for (var i = offset; i < number; i++) {
            result.push(i)
        }
        return result;
    }
}

module.exports = monContract;

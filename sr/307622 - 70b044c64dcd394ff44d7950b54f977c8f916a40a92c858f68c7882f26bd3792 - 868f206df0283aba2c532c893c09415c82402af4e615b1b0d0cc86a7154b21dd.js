"use strict";

var SingleColor = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.colorname = obj.colorname;
        this.colordes = obj.colordes;
        this.startcolor = obj.startcolor;
        this.tocolor = obj.tocolor;
        this.gradientAngle = obj.gradientAngle;
	} else {
        this.colorname = '';
        this.colordes = '';
        this.startcolor = '';
        this.tocolor = '';
        this.gradientAngle = 0;
	}
};

SingleColor.prototype = {
	toString: function () {
        return JSON.stringify(this);
      }
};

var Color = function () {
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

Color.prototype = {
    init: function () {
        this.size = 0;
    },
    postColor: function (colorname,colordes,startcolor,tocolor,gradientAngle) {
        var colorItem = new SingleColor();
        colorItem.colorname = colorname;
        colorItem.colordes = colordes;
        colorItem.startcolor = startcolor;
        colorItem.tocolor = tocolor;
        colorItem.gradientAngle = gradientAngle;
        var index = this.size;
        this.dataMap.set(index, JSON.stringify(colorItem));
        this.size += 1;
    },
    get: function(key) {
        return JSON.parse(this.dataMap.get(key));
    },

    len: function() {
        return this.size;
    },
    forEach: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }

        var myArray = [];
        for (var i = offset; i < number; i++) {
            var object = JSON.parse(this.dataMap.get(i));
            myArray.push(object);
        }
        return myArray;
    }

};
module.exports = Color;
"use strict";
var Category;
(function (Category) {
    Category[Category["crypto"] = 0] = "crypto";
    Category[Category["dogs"] = 1] = "dogs";
    Category[Category["cute"] = 2] = "cute";
    Category[Category["memes"] = 3] = "memes";
    Category[Category["programming"] = 4] = "programming";
    Category[Category["games"] = 5] = "games";
    Category[Category["cars"] = 6] = "cars";
    Category[Category["art"] = 7] = "art";
    Category[Category["fun"] = 8] = "fun";
    Category[Category["other"] = 9] = "other";
})(Category || (Category = {}));
var unitMap = {
    'none': '0',
    'None': '0',
    'wei': '1',
    'kwei': '1000',
    'mwei': '1000000',
    'gwei': '1000000000',
    'nas': '1000000000000000000',
};
function unitValue(unit) {
    unit = unit ? unit.toLowerCase() : 'nas';
    var unitValue = unitMap[unit];
    if (unitValue === undefined) {
        throw new Error("The unit " + unit + " does not exist, please use the following units: " + JSON.stringify(unitMap, null, 2));
    }
    return new BigNumber(unitValue, 10);
}
function toBasic(value, unit) {
    return value.mul(unitValue(unit));
}
function fromBasic(value, unit) {
    return value.div(unitValue(unit));
}
var Image = /** @class */ (function () {
    function Image(json) {
        if (json) {
            var object = JSON.parse(json);
            this.width = object.width;
            this.height = object.height;
            this.url = object.url;
            this.name = object.name;
            this.author = object.author;
            this.category = object.category;
        }
    }
    Image.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return Image;
}());
var Upload = /** @class */ (function () {
    function Upload(json) {
        if (json) {
            var object = JSON.parse(json);
            this.value = object.value;
        }
    }
    Upload.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return Upload;
}());
var ImgCubeContract = /** @class */ (function () {
    function ImgCubeContract() {
        LocalContractStorage.defineMapProperty(this, 'images', {
            parse: function (json) {
                return new Image(json);
            },
            stringify: function (object) {
                return object.toString();
            }
        });
        LocalContractStorage.defineMapProperty(this, 'nextUploads', {
            parse: function (json) {
                return new Upload(json);
            },
            stringify: function (object) {
                return object.toString();
            }
        });
        LocalContractStorage.defineProperty(this, 'imageCount', null);
    }
    ImgCubeContract.prototype.init = function () {
        this.imageCount = 0;
    };
    ImgCubeContract.prototype.payUpload = function () {
        if (this.nextUploads.get(Blockchain.transaction.from)) {
            var upload = this.nextUploads.get(Blockchain.transaction.from);
            Blockchain.transfer(Blockchain.transaction.from, upload.value);
            this.nextUploads.del(Blockchain.transaction.from);
        }
        this.nextUploads.set(Blockchain.transaction.from, new Upload(JSON.stringify({
            value: Blockchain.transaction.value
        })));
        return true;
    };
    ImgCubeContract.prototype.returnPaidUpload = function () {
        var upload = this.nextUploads.get(Blockchain.transaction.from);
        if (upload) {
            Blockchain.transfer(Blockchain.transaction.from, upload.value);
            this.nextUploads.del(Blockchain.transaction.from);
            return true;
        }
        return false;
    };
    ImgCubeContract.prototype.upload = function (rawImages) {
        var value = new BigNumber(this.nextUploads.get(Blockchain.transaction.from).value);
        var price = new BigNumber(0);
        for (var _i = 0, rawImages_1 = rawImages; _i < rawImages_1.length; _i++) {
            var rawImage = rawImages_1[_i];
            price = price.plus(toBasic(new BigNumber(new BigNumber(rawImage.width * rawImage.height).div(18300000).toFixed(18)), 'nas'));
            var image = new Image(JSON.stringify(rawImage));
            this.images.set(this.imageCount, image);
            this.imageCount++;
        }
        if (value.lt(price)) {
            throw new Error("Not enough NAS sent (" + fromBasic(price, 'nas') + " expected, " + fromBasic(value, 'nas') + " sent).");
        }
        this.nextUploads.del(Blockchain.transaction.from);
        return true;
    };
    ImgCubeContract.prototype.get = function (id) {
        return this.images.get(id);
    };
    ImgCubeContract.prototype.getImageCount = function () {
        return this.imageCount;
    };
    ImgCubeContract.prototype.query = function (count, offset, category) {
        if (offset === void 0) { offset = 0; }
        var images = [];
        for (var i = offset; i < offset + count; i++) {
            var image = this.images.get(i);
            if (!image) {
                continue;
            }
            if (image.category === category || category === undefined) {
                images.push(image);
            }
        }
        return images;
    };
    return ImgCubeContract;
}());
module.exports = ImgCubeContract;
//# sourceMappingURL=contract.js.map
'use strict';
var CheckDayContract = function () {
    LocalContractStorage.defineMapProperty(this, 'lastCheckHeight', {
        parse: function (str) {
            if (!str) {
                return new BigNumber(0);
            }
            return new BigNumber(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'total', {
        parse: function (str) {
            if (!str) {
                return new BigNumber(0);
            }
            return new BigNumber(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};
CheckDayContract.prototype = {
    init: function () {},
    check: function (height) {
        var from = Blockchain.transaction.from;
        var height = new BigNumber(Blockchain.block.height);
        var ls_height = this.lastCheckHeight.get(from);
        if (!ls_height) {
            ls_height = new BigNumber(0)
        }
        var total = this.total.get(from);
        if (ls_height && height.lt(ls_height)) {
            throw new Error('Already check.');
        }
        if (!ls_height || ls_height.isZero()) {
            total = new BigNumber(1);
        } else {
            total = total.plus(1);
        }
        this.lastCheckHeight.put(from, ls_height.plus(height));
        this.total.put(from, total);
    },
    dayOfCheck: function () {
        var from = Blockchain.transaction.from;
        return {
            total: this.total.get(from),
            lastCheckTime: this.lastCheckHeight.get(from)
        }
    }
}
module.exports = CheckDayContract;
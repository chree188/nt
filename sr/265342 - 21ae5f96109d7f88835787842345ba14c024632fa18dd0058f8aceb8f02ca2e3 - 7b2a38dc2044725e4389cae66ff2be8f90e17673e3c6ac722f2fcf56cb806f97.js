function OpenMarket() {

}

OpenMarket.prototype = {
    init: function () {

    },
    get_id: function () {
        return LocalContractStorage.get('key1');
    },
    set_id: function (val) {
        return LocalContractStorage.set('key1', val);
    }
};

module.exports = OpenMarket;
var Goods = function () {
    LocalContractStorage.defineMapProperty(this, "GoodsMap", null)
}

Goods.prototype = {
    init: function () { },

    save: function (tip,name,url,business,type) {
        var goods = this.GoodsMap.get(name);

        if (goods == null) {
            goods = [];
        }

        var goodsItem = {
			tip:tip,
            name:name,
			url:url,
			business:business,
            type:type
        };
        goods.push(goodsItem);

        this.GoodsMap.put(name, goods);
        return goodsItem;
    },

    get: function (name) {        
        return this.GoodsMap.get(name);
    }
}

module.exports = Goods;
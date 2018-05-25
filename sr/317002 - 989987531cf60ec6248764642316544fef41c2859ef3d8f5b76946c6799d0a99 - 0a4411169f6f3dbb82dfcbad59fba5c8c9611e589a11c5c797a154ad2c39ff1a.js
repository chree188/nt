/**
 * Created by mac on 2018/5/16.
 */

function InfoData(data) {
    if (data) {
        this.hash = data.hash;
        this.name = data.name;
        this.summary = data.summary;
        this.avatar = data.avatar;
        this.backgroundColor = data.backgroundColor;
        if (!this.backgroundColor || this.backgroundColor.length === 0) {
            this.backgroundColor = '#fff';
        }
        this.textColor = data.textColor;
        if (!this.textColor || this.textColor.length === 0) {
            this.textColor = '#666';
        }
        this.buttonColor = data.buttonColor;
        if (!this.buttonColor || this.buttonColor.length === 0) {
            this.buttonColor = '#007bff';
        }
    }
}

function InformationContract() {
    LocalContractStorage.defineMapProperty(this, "info_datas", {
        stringify: function (item) {
            return JSON.stringify(item);
        },
        parse: function (text) {
            return new InfoData(JSON.parse(text));
        }
    });
}

InformationContract.prototype = {
    init: function () {

    },
    fetch: function (hash) {
        return this.info_datas.get(hash);
    },
    post: function (data) {
        var owner = Blockchain.transaction.from;
        data.hash = owner;
        var d = new InfoData(data);
        return this.info_datas.set(owner, d);
    }
};

module.exports = InformationContract;

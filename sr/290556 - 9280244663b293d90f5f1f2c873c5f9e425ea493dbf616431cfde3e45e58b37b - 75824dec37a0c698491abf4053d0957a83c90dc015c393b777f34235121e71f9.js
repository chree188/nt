// Nv Shen Lai Le
// @author jnoodle

'use strict'

var Nvshen = function () {
    LocalContractStorage.defineProperty(this, 'admin');
    LocalContractStorage.defineProperty(this, 'adminGit');
    LocalContractStorage.defineProperty(this, 'adminAddress');

    LocalContractStorage.defineProperty(this, 'indexArr');
    LocalContractStorage.defineProperty(this, 'accessLog');
};

Nvshen.prototype = {
    init: function () {
        // administrator info
        this.admin = 'jnoodle';
        this.adminGit = 'https://github.com/jnoodle';
        this.adminAddress = [
            'n1XMiqLcT1acKhp3pC57BgEckVjgTEATc8V',  // mainnet
            'n1PKB6CC4BXT61bGGdtHo9998gj1QmUAGhB',  // testnet
            'n1FF1nz6tarkDVwWQkMnnwFPuPKUaQTdptE'   // local
        ];

        this.indexArr = []
    },

    about: function () {
        return JSON.stringify({
            name: 'Nv Shen Lai Le',
            author: this.admin,
            authorGit: this.adminGit,
            url: 'http://nvshen.nebulas.cool',
            donateAddress: 'n1XMiqLcT1acKhp3pC57BgEckVjgTEATc8V'
        });
    },

    set: function (ia) {
        if (ia) {
            if (!Array.isArray(ia))
                throw new Error('Param ia type must be string array.');
            if (this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
                throw new Error('You don\'t have permission.');
            }
            let all = JSON.parse(JSON.stringify(this.indexArr || []));
            for (let i of ia) {
                all.push(i)
            }
            this.indexArr = all;
        } else {
            throw new Error('Param ia is required.');
        }
    },

    get: function () {
        if (this.indexArr.length > 0) {
            let rand = parseInt(Math.random() * this.indexArr.length)
            let from = Blockchain.transaction.from
            let time = +new Date();
            this.accessLog = this.accessLog + '\n' + this.indexArr[rand] + ',' + from + ',' + time;
            return this.indexArr[rand];
        } else {
            return {}
        }
    },

    del: function (id) {
        let index = this.indexArr.indexOf(id);
        let all = JSON.parse(JSON.stringify(this.indexArr || []));
        if (index > -1) {
            all.splice(index, 1);
            this.indexArr = all;
        }
    },

    clear: function () {
        if (this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
            throw new Error('You don\'t have permission.');
        }
        this.indexArr = [];
        return 'success';
    },

    getAll: function () {
        if (this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
            throw new Error('You don\'t have permission.');
        }
        return this.indexArr;
    },

    getLog: function () {
        if (this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
            throw new Error('You don\'t have permission.');
        }
        return this.accessLog;
    },

};

module.exports = Nvshen;

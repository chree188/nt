// NAS Smart Contract Explorer
// @author jnoodle

'use strict'

var Sce = function () {
    LocalContractStorage.defineProperty(this, 'admin');
    LocalContractStorage.defineProperty(this, 'adminGit');
    LocalContractStorage.defineProperty(this, 'adminAddress');
    LocalContractStorage.defineProperty(this, 'accessLog');
    LocalContractStorage.defineProperty(this, 'accessKey');
};

Sce.prototype = {
    init: function () {
        // administrator info
        this.admin = 'jnoodle';
        this.adminGit = 'https://github.com/jnoodle';
        this.adminAddress = [
            'n1XMiqLcT1acKhp3pC57BgEckVjgTEATc8V',  // mainnet
            'n1PKB6CC4BXT61bGGdtHo9998gj1QmUAGhB',  // testnet
            'n1FF1nz6tarkDVwWQkMnnwFPuPKUaQTdptE'   // local
        ];

        this.accessLog = ''
        this.accessKey = []
    },

    about: function () {
        return JSON.stringify({
            name: 'NAS Smart Contract Explorer',
            author: this.admin,
            authorGit: this.adminGit,
            url: 'http://nscexplorer.nebulas.cool',
            donateAddress: 'n1XMiqLcT1acKhp3pC57BgEckVjgTEATc8V'
        });
    },

    generateAccessKey: function () {
        var _0x187d=['toString','000','length','charCodeAt'];(function(_0x70c73f,_0x16371f){var _0xaf7d9=function(_0x4e14e8){while(--_0x4e14e8){_0x70c73f['push'](_0x70c73f['shift']());}};_0xaf7d9(++_0x16371f);}(_0x187d,0x96));var _0x5108=function(_0x246690,_0x3abda6){_0x246690=_0x246690-0x0;var _0x5df69a=_0x187d[_0x246690];return _0x5df69a;};function _encode(_0x1edf96,_0x319d56,_0x27ffeb){let _0x55adad=_0x319d56+','+_0x27ffeb;let _0x33b537,_0x4302b3;let _0xe799e3='';for(_0x4302b3=0x0;_0x4302b3<_0x55adad[_0x5108('0x0')];_0x4302b3++){_0x33b537=_0x55adad[_0x5108('0x1')](_0x4302b3)[_0x5108('0x2')](0x10);_0xe799e3+=(_0x5108('0x3')+_0x33b537)['slice'](-0x4);}return _0xe799e3;}

        let from = Blockchain.transaction.from
        let timestamp = Blockchain.transaction.timestamp
        let timeNow = +new Date();
        let accesskey = _encode(from, timestamp, timeNow)
        this.accessLog = this.accessLog + '\n' + from + ',' + timeNow;

        let all = JSON.parse(JSON.stringify(this.accessKey || []));
        all.push(accesskey)
        this.accessKey = all;

        return accesskey
    },

    assertAccessKey: function (key) {
        return this.accessKey.indexOf(key) > -1;
    },

    clearLog: function () {
        if (this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
            throw new Error('You don\'t have permission.');
        }
        this.accessLog = [];
        return 'success';
    },

    getLog: function () {
        if (this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
            throw new Error('You don\'t have permission.');
        }
        return this.accessLog;
    },

    getAccessKey: function () {
        if (this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
            throw new Error('You don\'t have permission.');
        }
        return this.accessKey;
    },

};

module.exports = Sce;

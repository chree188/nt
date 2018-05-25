// Nebulas DApp Store  http://nebulas.cool
// @author jnoodle

"use strict";

var NebulasDAppStore = function () {
    LocalContractStorage.defineProperty(this, 'admin');
    LocalContractStorage.defineProperty(this, 'adminGit');
    LocalContractStorage.defineProperty(this, 'adminAddress');

    LocalContractStorage.defineProperty(this, 'appTotalCount');  // app total count
    LocalContractStorage.defineProperty(this, 'appSummary');    // app summary, used to verify cache
    LocalContractStorage.defineMapProperty(this, 'appInfo');  // app info map
};

NebulasDAppStore.prototype = {
    init: function () {
        // administrator info
        this.admin = 'jnoodle';
        this.adminGit = 'https://github.com/jnoodle';
        this.adminAddress = [
            'n1XMiqLcT1acKhp3pC57BgEckVjgTEATc8V',  // mainnet
            'n1PKB6CC4BXT61bGGdtHo9998gj1QmUAGhB',  // testnet
            'n1FF1nz6tarkDVwWQkMnnwFPuPKUaQTdptE'   // local
        ];

        // data initialization
        this.appTotalCount = 0;
        this.appSummary = [];
    },

    // get contract info
    about: function () {
        return JSON.stringify({
            name: 'Nebulas DApp Store',
            author: this.admin,
            authorGit: this.adminGit,
            url: 'http://nebulas.cool',
            donateAddress: 'n1XMiqLcT1acKhp3pC57BgEckVjgTEATc8V'
        });
    },

    // get app summary array
    getAppSummary: function () {
        return this.appSummary;
    },

    // get app total count
    getAppTotalCount: function () {
        return this.appTotalCount;
    },

    // get batch app info array by app id array
    getAppInfo: function (appIdArray) {
        if (appIdArray) {
            if (!Array.isArray(appIdArray)) throw new Error('Param appIdArray type must be string array.');
            let result = []
            for (let id of appIdArray) {
                let info = this.appInfo.get((id + '').trim())
                if (info) {
                    info.id = id;
                    result.push(info)
                }
            }
            return result;
        } else {
            throw new Error('Param appIdArray is required.');
        }
    },

    // generate unique appId
    _generateAppId: function () {
        let id = '';
        do {
            id = 'id' + (parseInt(+Date.now() / 1000) * 2);
        } while (this.appInfo.get(id))
        return id;
    },

    // submit new app
    appSubmit: function (jsonText) {
        if (jsonText) {
            if (typeof jsonText !== 'string') throw new Error('Param jsonText is not string');
            let info = {};
            let obj = JSON.parse(jsonText);
            // 数据校验
            if (!obj.name) throw new Error('App name is required.');
            if (!obj.type) throw new Error('App type is required.');
            if (['APPLICATION', 'GAME', 'OTHERS'].indexOf(obj.type.trim()) < 0) throw new Error('App type illegal.');
            if (!obj.url) throw new Error('App url is required.');
            if (!obj.author) throw new Error('App author is required.');

            info.name = obj.name.trim();  // app name
            info.type = obj.type.trim();  // app type APPLICATION/GAME/OTHERS
            info.subType = (obj.subType || '').trim();  // app subType
            info.description = (obj.description || '').trim();  // app description
            info.url = obj.url.trim();  // app access url
            info.icon = (obj.icon || '').trim();  // app icon base64，480x480
            info.author = obj.author.trim();  // author name
            info.screenshot = obj.screenshot || []; // app screenshots array<base64 string>
            info.contractAddress = obj.contractAddress || '';  // app contract address string

            info.updateTime = +new Date();  // data update time
            info.authorAddress = Blockchain.transaction.from; // author nebulas wallet address
            info.status = 1;  // app status：0-disabled 1-on sale
            info.updateBlock = Blockchain.block;  // app update block
            info.comment = [];  // app comments

            let id = this._generateAppId();
            this.appInfo.set(id, info);

            // update app total count
            this.appTotalCount++;

            // update app summary
            let summary = JSON.parse(JSON.stringify(this.appSummary || []));  // deep copy
            summary.push({
                id: id,
                updateTime: info.updateTime
            })
            this.appSummary = summary;
        } else {
            throw new Error('App info is required.');
        }
    },

    // update app info
    appUpdate: function (id, jsonText) {
        if (typeof id === 'undefined') throw new Error('Param id is required.');
        if (typeof jsonText === 'undefined') throw new Error('Param jsonText is required.');
        if (typeof id !== 'string') throw new Error('Param id is not string');
        if (typeof jsonText !== 'string') throw new Error('Param jsonText is not string');
        let info = this.appInfo.get(id);
        if (!info) throw new Error('App id is not exist');
        // only author or administrator can update app info
        if (info.authorAddress !== Blockchain.transaction.from
            && this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
            throw new Error('You don\'t have permission to update this app.');
        }

        let obj = JSON.parse(jsonText);
        if (obj.type && ['APPLICATION', 'GAME', 'OTHERS'].indexOf(obj.type.trim()) < 0) {
            throw new Error('App type illegal.');
        }

        if (obj.name) info.name = obj.name.trim();  // app name
        if (obj.type) info.type = obj.type.trim();  // app type APPLICATION/GAME/OTHERS
        if (obj.subType) info.subType = obj.subType.trim();  // app subType
        if (obj.description) info.description = obj.description.trim();  // app description
        if (obj.url) info.url = obj.url.trim();  // app access url
        if (obj.icon) info.icon = obj.icon.trim();  // app icon base64，480x480
        if (obj.author) info.author = obj.author.trim();  // author name
        if (obj.screenshot) info.screenshot = obj.screenshot; // app screenshots array<base64 string>
        if (obj.contractAddress) info.contractAddress = obj.contractAddress;  // app contract address

        info.updateTime = +new Date();  // data update time
        info.status = 1; // app status：0-disabled 1-on sale
        info.updateBlock = Blockchain.block;  // app update block

        this.appInfo.set(id, info);

        // update app summary
        let summary = JSON.parse(JSON.stringify(this.appSummary || []));
        let currentSummaryIndex = summary.findIndex(function (element) {
            return element.id === id;
        });
        if (currentSummaryIndex < 0) {
            summary.push({
                id: id,
                updateTime: info.updateTime
            })
        } else {
            summary[currentSummaryIndex] = {
                id: id,
                updateTime: info.updateTime
            }
        }
        this.appSummary = summary;
    },

    // update app status
    _appUpdateStatus: function (id, status) {
        if (typeof status === 'undefined') throw new Error('App status is required.');
        let info = this.appInfo.get(id);
        if (!info) throw new Error('App id is not exist');
        // only author or administrator can update app info
        if (info.authorAddress !== Blockchain.transaction.from
            && this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
            throw new Error('You don\'t have permission to off this app.');
        }

        info.updateTime = +new Date();
        info.status = status;

        this.appInfo.set(id, info);

        // update app summary
        let summary = JSON.parse(JSON.stringify(this.appSummary || []));
        let currentSummaryIndex = summary.findIndex(function (element) {
            return element.id === id;
        });
        if (currentSummaryIndex < 0) {
            summary.push({
                id: id,
                updateTime: info.updateTime
            })
        } else {
            summary[currentSummaryIndex] = {
                id: id,
                updateTime: info.updateTime
            }
        }
        this.appSummary = summary;
    },

    // disable app
    appOff: function (id) {
        if (typeof id === 'undefined') throw new Error('Param id is required.');
        if (typeof id !== 'string') throw new Error('Param id is not string');
        this._appUpdateStatus(id, 0)
    },

    // enable app
    appOn: function (id) {
        if (typeof id === 'undefined') throw new Error('Param id is required.');
        if (typeof id !== 'string') throw new Error('Param id is not string');
        this._appUpdateStatus(id, 1)
    },

    // delete app
    appDelete: function (id) {
        if (typeof id === 'undefined') throw new Error('Param id is required.');
        if (typeof id !== 'string') throw new Error('Param id is not string');
        let info = this.appInfo.get(id);
        if (!info) throw new Error('App id is not exist');
        // only author or administrator can update app info
        if (info.authorAddress !== Blockchain.transaction.from
            && this.adminAddress.indexOf(Blockchain.transaction.from) < 0) {
            throw new Error('You don\'t have permission to delete this app.');
        }

        this.appInfo.del(id);

        // update app total count
        this.appTotalCount--;

        // update app summary
        let summary = JSON.parse(JSON.stringify(this.appSummary || []));
        let currentSummaryIndex = summary.findIndex(function (element) {
            return element.id === id;
        });
        if (currentSummaryIndex >= 0) {
            summary.splice(currentSummaryIndex, 1);
        }
        this.appSummary = summary;
    },

    // submit comment
    commentSubmit: function (id, commentJson) {
        if (typeof id === 'undefined') throw new Error('Param id is required.');
        if (typeof commentJson === 'undefined') throw new Error('Param commentJson is required.');
        if (typeof id !== 'string') throw new Error('Param id is not string');
        if (typeof commentJson !== 'string') throw new Error('Param commentJson is not string');
        let info = this.appInfo.get(id);
        if (!info) throw new Error('App id is not exist');

        let comment = JSON.parse(commentJson);
        if (!comment.score) throw new Error('Comment score is required.');
        if ([1, 2, 3, 4, 5].indexOf(comment.score) < 0) throw new Error('Comment score must be 1-5.');
        if (!comment.author) throw new Error('Comment author is required.');

        // An address can only commit one comment.
        let currentComment = info.comment.findIndex(function (element) {
            return element.authorAddress === Blockchain.transaction.from;
        });
        if (currentComment < 0) {
            info.comment.push({
                score: comment.score,
                content: (comment.content || '').trim(),
                author: comment.author.trim(),
                updateTime: +new Date(),
                authorAddress: Blockchain.transaction.from
            })
        } else {
            info.comment[currentComment] = {
                score: comment.score,
                content: (comment.content || '').trim(),
                author: comment.author.trim(),
                updateTime: +new Date(),
                authorAddress: Blockchain.transaction.from
            }
        }

        info.updateTime = +new Date();
        this.appInfo.set(id, info);

        // update app summary
        let summary = JSON.parse(JSON.stringify(this.appSummary || []));
        let currentSummaryIndex = summary.findIndex(function (element) {
            return element.id === id;
        });
        if (currentSummaryIndex < 0) {
            summary.push({
                id: id,
                updateTime: info.updateTime
            })
        } else {
            summary[currentSummaryIndex] = {
                id: id,
                updateTime: info.updateTime
            }
        }
        this.appSummary = summary;
    }
};

module.exports = NebulasDAppStore;

'use strict';
var VoteVaultContract = function () {
    LocalContractStorage.defineMapProperty(this, "voteVault", {
        parse: function (value) {
            return value;
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

VoteVaultContract.prototype = {
    init: function () {
        //TODO:
    },

    save: function (key) {
        if (key === "") {
            return {
                "status": -2,
                "msg": "empty key"
            }
        }

        if (key.length > 12) {
            return {
                "status": -1,
                "msg": "Invalid key"
            }
        }
        var from = Blockchain.transaction.from;

        var type = this.voteVault.get(from)
        if (type) {
            return {
                "status": 0,
                "msg": "has voted " + type,
                "voteType": type
            }
        }

        var orig_value = this.voteVault.get(key);
        if (orig_value) {
            orig_value = orig_value + 1;
        } else {
            orig_value = 1;
        }

        this.voteVault.put(from, key);
        this.voteVault.put(key, orig_value);
        return {
            "status": 1,
            "msg": "voted " + key + " succeed",
            "voteType": type
        }
    },

    take: function (key) {
        if (key === "") {
            throw new Error("empty key")
        }

        var take_value = this.voteVault.get(key);
        if (key.length > 12) {
            if (take_value) {
                return {
                    "hasVoted": true,
                    "type": take_value
                }
            } else {
                return {
                    "hasVoted": false
                }
            }

        } else {
            if (!take_value) {
                take_value = new BigNumber(0);
            }
            return {
                "voteCnt": take_value,
                "voteType": key
            }
        }


        Event.Trigger("voteVault", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: Blockchain.transaction.from,
                value: take_value.toString()
            }
        });

    }
};
module.exports = VoteVaultContract;
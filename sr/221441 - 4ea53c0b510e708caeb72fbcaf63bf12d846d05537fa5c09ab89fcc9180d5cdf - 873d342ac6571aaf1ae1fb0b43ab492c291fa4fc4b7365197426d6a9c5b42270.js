'use strict'

function safeAdd(x, y) {
    var lsw = (x & 0xffff) + (y & 0xffff);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
}
function bitRotateLeft(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
}
function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
function binlMD5(x, len) {
    x[len >> 5] |= 0x80 << (len % 32);
    x[((len + 64) >>> 9 << 4) + 14] = len;
    var i;
    var olda;
    var oldb;
    var oldc;
    var oldd;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    for (i = 0; i < x.length; i += 16) {
        olda = a;
        oldb = b;
        oldc = c;
        oldd = d;
        a = md5ff(a, b, c, d, x[i], 7, -680876936);
        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = md5gg(b, c, d, a, x[i], 20, -373897302);
        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = md5hh(d, a, b, c, x[i], 11, -358537222);
        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = md5ii(a, b, c, d, x[i], 6, -198630844);
        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = safeAdd(a, olda);
        b = safeAdd(b, oldb);
        c = safeAdd(c, oldc);
        d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
}
function binl2rstr(input) {
    var i;
    var output = '';
    var length32 = input.length * 32;
    for (i = 0; i < length32; i += 8) {
        output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff);
    }
    return output;
}
function rstr2binl(input) {
    var i;
    var output = [];
    output[(input.length >> 2) - 1] = undefined;
    for (i = 0; i < output.length; i += 1) {
        output[i] = 0;
    }
    var length8 = input.length * 8;
    for (i = 0; i < length8; i += 8) {
        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32);
    }
    return output;
}
function rstrMD5(s) {
    return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
}
function rstrHMACMD5(key, data) {
    var i;
    var bkey = rstr2binl(key);
    var ipad = [];
    var opad = [];
    var hash;
    ipad[15] = opad[15] = undefined;
    if (bkey.length > 16) {
        bkey = binlMD5(bkey, key.length * 8);
    }
    for (i = 0; i < 16; i += 1) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5c5c5c5c;
    }
    hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
    return binl2rstr(binlMD5(opad.concat(hash), 512 + 128));
}
function rstr2hex(input) {
    var hexTab = '0123456789abcdef';
    var output = '';
    var x;
    var i;
    for (i = 0; i < input.length; i += 1) {
        x = input.charCodeAt(i);
        output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
    }
    return output;
}
function str2rstrUTF8(input) {
    return unescape(encodeURIComponent(input));
}
function rawMD5(s) {
    return rstrMD5(str2rstrUTF8(s));
}
function hexMD5(s) {
    return rstr2hex(rawMD5(s));
}
function rawHMACMD5(k, d) {
    return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
}
function hexHMACMD5(k, d) {
    return rstr2hex(rawHMACMD5(k, d));
}

function md5(string, key, raw) {
    if (!key) {
        if (!raw) {
            return hexMD5(string);
        }
        return rawMD5(string);
    }
    if (!raw) {
        return hexHMACMD5(key, string);
    }
    return rawHMACMD5(key, string);
}


var RockPaperScissors = function () {
    LocalContractStorage.defineProperties(this, {
        isOpen: null,
        currentGameId: null,
        adminAddress: null,
        opengames: null
    });
    LocalContractStorage.defineMapProperty(this, 'games');
    LocalContractStorage.defineMapProperty(this, 'usergames');
};

RockPaperScissors.prototype = {
    init: function () {
        this.isOpen = true;
        this.currentGameId = 0;
        this.adminAddress = Blockchain.transaction.from;
        this.opengames = [];
    },

    getGame: function (id) {
        return this.games.get(id);
    },

    getUserGames: function (address) {
        return this.usergames.get(address);
    },

    getOpenGames: function () {
        return this.opengames;
    },

    lastGame: function (limit) {
        var result = [];
        var count = this.currentGameId - limit > 0 ? limit : this.currentGameId;
        for (var i = 0; i < count; i++) {
            var d = this.games.get(this.currentGameId - i);
            d.id = this.currentGameId - i;
            result.push(d);
        }
        return result;
    },

    newGame: function (playAHash) {
        if (!this.isOpen) {
            throw new Error("Game is currently closed");
        }
        if (playAHash.length !== 32) {
            throw new Error("Invaild Hash");
        }
        this.currentGameId += 1;
        var id = this.currentGameId;
        var playerAAddress = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        this.games.put(id, {
            amount: value,
            playerAAddress: playerAAddress,
            playerAChoice: null,
            playerAHash: playAHash,
            playerBAddress: null,
            playerBChoice: null,
            playerBHash: null,
            endTime: null,
            isEnd: false
        });
        this.opengames.push(id);
        var usergame = this.usergames.get(Blockchain.transaction.from);
        if (usergame === null) {
            this.usergames.set(Blockchain.transaction.from, [id]);
        } else {
            usergame.push(id);
            this.usergames.set(Blockchain.transaction.from, usergame);
        }
        Event.Trigger('newgame', {
            id: id
        });
        return id;
    },

    joinGame: function (id, playBHash) {
        var game = this.games.get(id);
        if (!this.isOpen) {
            throw new Error("Game is currently closed");
        }
        if (playBHash.length !== 32) {
            throw new Error("Invaild hash");
        }
        if (game.isEnd === true) {
            throw new Error("Game is over");
        }
        if (game.playerBAddress !== null) {
            throw new Error("There are already two players in this game");
        }
        var value = new BigNumber(Blockchain.transaction.value);
        if (value < game.amount) {
            throw new Error("Insufficient funds");
        } else if (value > game.amount) {
            var diff = value.minus(game.amount);
            var result = Blockchain.transfer(Blockchain.transaction.from, diff);
            Event.Trigger('transfer', {
                to: Blockchain.transaction.from,
                value: diff
            });
            if (!result) {
                throw new Error("Unexpected error");
            }
        }
        game.playerBAddress = Blockchain.transaction.from;
        game.playerBHash = playBHash;
        this.games.set(id, game);
        var usergame = this.usergames.get(Blockchain.transaction.from);
        if (usergame === null) {
            this.usergames.set(Blockchain.transaction.from, [id]);
        } else {
            if (usergame.indexOf(id) === -1) {
                usergame.push(id);
                this.usergames.set(Blockchain.transaction.from, usergame);
            }
        }
    },

    revealGame: function (id, choice, salt) {
        var game = this.games.get(id);
        if (!this.isOpen) {
            throw new Error("Game is currently closed");
        }
        if (game.isEnd === true) {
            throw new Error("Game is over");
        }
        if ([1, 2, 3].indexOf(choice) === -1) {
            throw new Error("Wrong choice");
        }
        if (game.playerAChoice === null && Blockchain.transaction.from === game.playerAAddress) {
            if (md5(choice + '!_!+@_@' + salt) === game.playerAHash) {
                game.playerAChoice = choice;
                game.endTime = Blockchain.block.timestamp + 60 * 60 * 24;
            } else {
                throw new Error("Hash doesn't matched");
            }
        } else if (game.playerBChoice === null && Blockchain.transaction.from === game.playerBAddress) {
            if (md5(choice + '!_!+@_@' + salt) === game.playerBHash) {
                game.playerBChoice = choice;
                game.endTime = Blockchain.block.timestamp + 60 * 60 * 24;
            } else {
                throw new Error("Hash doesn't matched");
            }
        } else {
            throw new Error("You're not in the game");
        }
        if (game.playerAChoice !== null && game.playerBChoice !== null) {
            var aWin = false;
            var bWin = false;
            if (game.playerAChoice === 1) {
                if (game.playerBChoice === 2) {
                    bWin = true;
                } else if (game.playerBChoice === 3) {
                    aWin = true;
                }
            } else if (game.playerAChoice === 2) {
                if (game.playerBChoice === 3) {
                    bWin = true;
                } else if (game.playerBChoice === 1) {
                    aWin = true;
                }
            } else if (game.playerAChoice === 3) {
                if (game.playerBChoice === 1) {
                    bWin = true;
                } else if (game.playerBChoice === 2) {
                    aWin = true;
                }
            }
            if (aWin) {
                Blockchain.transfer(game.playerAAddress, new BigNumber(game.amount).times(2));
                Event.Trigger('transfer', {
                    to: game.playerAAddress,
                    value: new BigNumber(game.amount).times(2)
                });
            } else if (bWin) {
                Blockchain.transfer(game.playerBAddress, new BigNumber(game.amount).times(2));
                Event.Trigger('transfer', {
                    to: game.playerBAddress,
                    value: new BigNumber(game.amount).times(2)
                });
            } else {
                Blockchain.transfer(game.playerAAddress, game.amount);
                Event.Trigger('transfer', {
                    to: game.playerAAddress,
                    value: game.amount
                });
                Blockchain.transfer(game.playerBAddress, game.amount);
                Event.Trigger('transfer', {
                    to: game.playerBAddress,
                    value: game.amount
                });
            }
            game.isEnd = true;
            this.opengames.pop(id);
        }
        this.games.set(id, game);
    },

    forceEnd: function (id) {
        var game = this.games.get(id);
        if (!this.isOpen) {
            throw new Error("Game is currently closed");
        }
        if (game.isEnd === true) {
            throw new Error("Game is over");
        }
        var currentUser = Blockchain.transaction.from;
        if (currentUser === game.playerAAddress && game.playerBAddress === null) {
            Blockchain.transfer(game.playerAAddress, game.amount);
            Event.Trigger('transfer', {
                to: game.playerAAddress,
                value: game.amount
            });
            game.isEnd = true;
            this.opengames.pop(id);
            this.games.set(id, game);
        } else if (game.playerAChoice !== null && game.playerBChoice === null && Blockchain.block.timestamp > game.endTime) {
            Blockchain.transfer(game.playerAAddress, new BigNumber(game.amount).times(2));
            Event.Trigger('transfer', {
                to: game.playerAAddress,
                value: new BigNumber(game.amount).times(2)
            });
            game.isEnd = true;
            this.opengames.pop(id);
            this.games.set(id, game);
        } else if (game.playerBChoice !== null && game.playerAChoice === null && Blockchain.block.timestamp > game.endTime) {
            Blockchain.transfer(game.playerBAddress, new BigNumber(game.amount).times(2));
            Event.Trigger('transfer', {
                to: game.playerBAddress,
                value: new BigNumber(game.amount).times(2)
            });
            game.isEnd = true;
            this.opengames.pop(id);
            this.games.set(id, game);
        } else if (currentUser === this.adminAddress) {
            game.isEnd = true;
            this.opengames.pop(id);
            this.games.set(id, game);
        } else {
            throw new Error("Unable to end this game");
        }
    },

    getIsOpen: function () {
        return this.isOpen;
    },

    getCurrentGameId: function () {
        return this.currentGameId;
    },

    getAdminAddress: function () {
        return this.adminAddress;
    },

    setIsOpen: function (isopen) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.isOpen = isopen;
        } else {
            throw new Error("Admin only");
        }
    },

    setAdminAddress: function (address) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.adminAddress = address;
        } else {
            throw new Error("Admin only");
        }
    },

    transfer: function (amount) {
        if (Blockchain.transaction.from === this.adminAddress) {
            Blockchain.transfer(this.adminAddress, amount);
            Event.Trigger('transfer', {
                to: this.adminAddress,
                value: amount
            });
        } else {
            throw new Error("Admin only");
        }
    }
};

module.exports = RockPaperScissors;
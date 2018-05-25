function SHA256(s) {
    /**
     *
     *  Secure Hash Algorithm (SHA256)
     *  http://www.webtoolkit.info/
     *
     *  Original code by Angel Marin, Paul Johnston.
     *
 **/
    var chrsz = 8;
    var hexcase = 0;

    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function S(X, n) {
        return (X >>> n) | (X << (32 - n));
    }

    function R(X, n) {
        return (X >>> n);
    }

    function Ch(x, y, z) {
        return ((x & y) ^ ((~x) & z));
    }

    function Maj(x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z));
    }

    function Sigma0256(x) {
        return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
    }

    function Sigma1256(x) {
        return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
    }

    function Gamma0256(x) {
        return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
    }

    function Gamma1256(x) {
        return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
    }

    function core_sha256(m, l) {
        var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
        var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
        var W = new Array(64);
        var a, b, c, d, e, f, g, h, i, j;
        var T1, T2;

        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;

        for (var i = 0; i < m.length; i += 16) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];

            for (var j = 0; j < 64; j++) {
                if (j < 16) W[j] = m[j + i];
                else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                T2 = safe_add(Sigma0256(a), Maj(a, b, c));
                h = g;
                g = f;
                f = e;
                e = safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = safe_add(T1, T2);
            }

            HASH[0] = safe_add(a, HASH[0]);
            HASH[1] = safe_add(b, HASH[1]);
            HASH[2] = safe_add(c, HASH[2]);
            HASH[3] = safe_add(d, HASH[3]);
            HASH[4] = safe_add(e, HASH[4]);
            HASH[5] = safe_add(f, HASH[5]);
            HASH[6] = safe_add(g, HASH[6]);
            HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
    }


    function str2binb(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;

        for (var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
        }

        return bin;
    }


    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }


    function binb2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
    }

    s = Utf8Encode(s);
    return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}

var nas2wei = function(nas){
    return nas * 1e18;
}

var Auction = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.item = o.item;
        this.owner = o.owner;

        this.bid_ddl = o.bid_ddl;
        this.reveal_ddl = o.reveal_ddl;
        this.min_bid = o.min_bid;
        this.addr2hash = o.addr2hash;
        this.addr2bid = o.addr2bid;
        this.top = o.top;
        this.second = o.second;

        this.result = o.result;
    } else {
        this.item = '';
        this.owner = '';

        this.bid_ddl = 0;
        this.reveal_ddl = 0;
        this.min_bid = 0;
        this.addr2hash = {};
        this.addr2bid = {};
        this.top = [];
        this.second = [];

        this.result = [];
    }
};

Auction.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var AuctionContract = function() {
    LocalContractStorage.defineProperties(this, {
        _index: null
    });
    LocalContractStorage.defineMapProperty(this, 'auctionArchive', {
        parse: function(text) {
            return new Auction(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};


AuctionContract.prototype = {
    init: function () {
        this._index = 0;

        /*this.set_auction("小鸟游六花手办", 0.001, 0, 0);
        var bid = 0.002;
        var salt = 123141;
        var hash_code = SHA256(bid + "" + salt);
        this.bid(0, hash_code);
        this.reveal(0, bid, salt);

        this.finish(0);
        return this.get_auctions();*/
    },

    set_auction: function(item, min_bid, bid_duration, reveal_duration) {
        var auction = new Auction();

        auction.item = item;
        auction.owner = Blockchain.transaction.from;

        auction.bid_ddl = Blockchain.block.height + bid_duration;
        auction.reveal_ddl = auction.bid_ddl + reveal_duration;
        auction.min_bid = min_bid;
        auction.addr2hash = {};
        auction.addr2bid = {};
        auction.top = [];
        auction.second = [];

        auction.result = [];

        this.auctionArchive.put(this._index, auction);
        this._index += 1;
        return auction;
    },

    bid: function(index, hash_code) {

        var auction = this.auctionArchive.get(index);

        if (Blockchain.block.height > auction.bid_ddl) {
            throw new Error("匿名投标阶段已过，请参与其他拍卖。")
        }

        if (auction.addr2hash[Blockchain.transaction.from]) {
            throw new Error("您已经参与过匿名投标，请不要重复提交。")
        }

        auction.addr2hash[Blockchain.transaction.from] = hash_code;
        this.auctionArchive.put(index, auction);
    },

    reveal: function(index, bid, salt) {
        var auction = this.auctionArchive.get(index);

        if (Blockchain.block.height < auction.bid_ddl) {
            throw new Error("当前还未到达公开投标阶段，请稍后再试。")
        }

        if (Blockchain.block.height > auction.reveal_ddl) {
            throw new Error("公开投标阶段已过，请参与其他拍卖。")
        }

        if (auction.addr2bid[Blockchain.transaction.from]) {
            throw new Error("您已经参与过公开投标，请不要重复提交。")
        }

        if (SHA256(bid+""+salt) != auction.addr2hash[Blockchain.transaction.from])
            throw new Error("竞价与随机数的组合验证失败，请核查后重试。")


        if (Blockchain.transaction.value != nas2wei(bid)) {
            Blockchain.transfer(Blockchain.transaction.from, nas2wei(Blockchain.transaction.value));
            throw new Error("投标价格与转账价格不符，请核查后重试。")
        }

        if (bid < auction.min_bid) {
            Blockchain.transfer(Blockchain.transaction.from, nas2wei(Blockchain.transaction.value));
            throw new Error("投标价格小于起拍价，请核查后重试。")
        }

        auction.addr2bid[Blockchain.transaction.from] = bid;
        if (!auction.top.length || bid > auction.top[0]) {
            auction.second = auction.top;
            auction.top = [bid, Blockchain.transaction.from];
        } else if (!auction.second.length || bid > auction.second[0]) {
            auction.second = [bid, Blockchain.transaction.from];
        }
        this.auctionArchive.put(index, auction);
        // TODO: transfer from bidder to contract

        return [auction.top, auction.second];
    },

    finish: function(index) {
        var auction = this.auctionArchive.get(index);

        if (Blockchain.block.height < auction.reveal_ddl) {
            throw new Error("当前还未到达揭示结果阶段，请稍后再试。")
        }

        if (auction.result.length)
            return ;

        if (!auction.top.length)
            return;

        for (var addr in auction.addr2bid) {
            var value_back = auction.addr2bid[addr];
            if (addr == auction.top[1]) {
                var value_take = auction.top[0];
                if (auction.second.length)
                    value_take = auction.second[0];

                value_back = auction.top[0] - value_take;

                auction.result = [value_take, auction.top[1]]
                // transfer value take from contract to owner
                Blockchain.transfer(auction.owner, nas2wei(value_take));
            }
            // transfer value back from contract to bidder
            Blockchain.transfer(addr, nas2wei(value_back));
        }
        this.auctionArchive.put(index, auction)
        return ;
    },

    get_auctions: function() {
        var status = []
        for (var i = 0; i < this._index; ++i)
            status.push(this.auctionArchive.get(i));
        return {'status':status,
                 'height': Blockchain.block.height};
    }
}

module.exports = AuctionContract;
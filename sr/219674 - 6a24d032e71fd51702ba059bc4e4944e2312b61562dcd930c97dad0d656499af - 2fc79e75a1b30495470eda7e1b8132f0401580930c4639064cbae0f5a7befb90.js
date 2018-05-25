
'use strict';

var nas2wei = function(nas){
    return nas * 1e18;
}

var MD5 = function (string) {

    function RotateLeft(lValue, iShiftBits) {
            return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }
 
    function AddUnsigned(lX,lY) {
            var lX4,lY4,lX8,lY8,lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                    if (lResult & 0x40000000) {
                            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                    } else {
                            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                    }
            } else {
                    return (lResult ^ lX8 ^ lY8);
            }
    }
 
    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }
 
    function FF(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
    };
 
    function GG(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
    };
 
    function HH(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
    };
 
    function II(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
    };
 
    function ConvertToWordArray(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWords_temp1=lMessageLength + 8;
            var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
            var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
            var lWordArray=Array(lNumberOfWords-1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while ( lByteCount < lMessageLength ) {
                    lWordCount = (lByteCount-(lByteCount % 4))/4;
                    lBytePosition = (lByteCount % 4)*8;
                    lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                    lByteCount++;
            }
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
            lWordArray[lNumberOfWords-2] = lMessageLength<<3;
            lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
            return lWordArray;
    };
 
    function WordToHex(lValue) {
            var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
            for (lCount = 0;lCount<=3;lCount++) {
                    lByte = (lValue>>>(lCount*8)) & 255;
                    WordToHexValue_temp = "0" + lByte.toString(16);
                    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
            }
            return WordToHexValue;
    };
 
    function Utf8Encode(string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
 
            for (var n = 0; n < string.length; n++) {
 
                    var c = string.charCodeAt(n);
 
                    if (c < 128) {
                            utftext += String.fromCharCode(c);
                    }
                    else if((c > 127) && (c < 2048)) {
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
    };
 
    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;
 
    string = Utf8Encode(string);
 
    x = ConvertToWordArray(string);
 
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
    for (k=0;k<x.length;k+=16) {
            AA=a; BB=b; CC=c; DD=d;
            a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
            d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
            c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
            b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
            a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
            d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
            c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
            b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
            a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
            d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
            c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
            b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
            a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
            d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
            c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
            b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
            a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
            d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
            c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
            b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
            a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
            d=GG(d,a,b,c,x[k+10],S22,0x2441453);
            c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
            b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
            a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
            d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
            c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
            b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
            a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
            d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
            c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
            b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
            a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
            d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
            c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
            b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
            a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
            d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
            c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
            b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
            a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
            d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
            c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
            b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
            a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
            d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
            c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
            b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
            a=II(a,b,c,d,x[k+0], S41,0xF4292244);
            d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
            c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
            b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
            a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
            d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
            c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
            b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
            a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
            d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
            c=II(c,d,a,b,x[k+6], S43,0xA3014314);
            b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
            a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
            d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
            c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
            b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
            a=AddUnsigned(a,AA);
            b=AddUnsigned(b,BB);
            c=AddUnsigned(c,CC);
            d=AddUnsigned(d,DD);
            }
 
        var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
        return temp.toLowerCase();
 }
  

 /** 01 game
  * payoff
  *     A  A
  *     0  1
  * B 0 +  -
  * B 1 -  +
  */

// todo: add game round
// todo: add events


var Game = function(){
    LocalContractStorage.defineProperties(this, {
        _name: null,
        _creator : null,
        _stake: null,
        _stale: null,
        _state: null, // state. 0: ready for hidden A, 1: ready for hidden B, 
                  // 2: ready for reveal first, 3: ready for reveal second
                  // 10: inner state, ready for decide
                  // 4: A is wrong, 5: B is wrong (if one side is wrong, give to the other side, if both wrong give it to the creator)
        _last_block: -1,
        _addr_A: null,
        _addr_B: null,
        _hidden_A: null,
        _hidden_B: null,
        _revealed_A: null,
        _revealed_B: null
    });
};

Game.prototype = {
    init: function(){
        this._name = "01Game";
        this._creator = Blockchain.transaction.from;
        
        this._stake = 0.1;
        this._stale = 100;

        this._state = 0;

        return 0;
    },

    // assert the contract is at correct state
    check_state: function(state){
        if (this._state == state ) {
            if(this._state != 0 && Blockchain.block.height > this._last_block + this._stale ){
                throw new Error("stale state");
                return 1;
            }else{
                return 0;
            }
        }else{
            throw new Error("incorrect state");
            return 1;
        }
    },

    _process_0: function(hidden){
        // A hidden -> 1
        this.check_state(0);

        if( Blockchain.transaction.value == nas2wei(this._stake) ){
            this._hidden_A = hidden;
            this._addr_A = Blockchain.transaction.from;
            this._state = 1;
            return 0;
        }else{
            throw new Error("error"+(this._stake.toString() + ","+Blockchain.transaction.value.toString()));
            return 1;
        }
    },

    _process_1: function(hidden){
        // B hidden -> 2
        this.check_state(1);

        if( Blockchain.transaction.from != this._addr_A && Blockchain.transaction.value == nas2wei(this._stake) ){
            this._hidden_B = hidden;
            this._addr_B = Blockchain.transaction.from;
            this._state = 2;
            return 0;
        }else{
            throw new Error("error");
            return 1;
        }
    },

    _process_2: function(revealed){
        // A or B reveal, correct -> 3
        // A reveal, wrong -> 4
        // B reveal, wrong -> 5
        this.check_state(2);
        
        var source = Blockchain.transaction.from;

        if (source == this._addr_A){
            if(MD5(revealed) == this._hidden_A){
                this._revealed_A = revealed;
                this._state = 3;
                return 0;
            }else{
                this._state = 4; // A is wrong
            }
        }else if (source == this._addr_B){
            if(MD5(revealed) == this._hidden_B){
                this._revealed_B = revealed;
                this._state = 3;
                return 0;
            }else{
                this._state = 5; // B is wrong
            }
            return 0;
        }else{
            throw new Error("error");
            return 1;
        }
    },
    
    _process_3: function(revealed){
        // A or B reveal, correct -> 10
        // A or B reveal, wrong -> 4 or 5

        // 10: AB same -> A wins
        // 10: AB diff -> B wins
        
        // 4: send 2x to B
        // 5: send 2x to A
        this.check_state(3);
        
        var source = Blockchain.transaction.from;

        if (this._revealed_A == null && source == this._addr_A){
            if( MD5(revealed) == this._hidden_A){
                this._revealed_A = revealed;
                this._state = 10;
            }else{
                this._state = 4; // A is wrong
            }
        }else if (this._revealed_B == null && source == this._addr_B){
            if(MD5(revealed) == this._hidden_B){
                this._revealed_B = revealed;
                this._state = 10;
            }else{
                this._state = 5; // B is wrong
            }
        }else{
            throw new Error("error");
            return 1;
        }

        // decide
        if (this._state == 10){
            var revealed_A = this._revealed_A;
            var revealed_B = this._revealed_B;
                
            var A = this.lastcharof(revealed_A);
            var B = this.lastcharof(revealed_B);

            if( this._winner_A(A, B) ){
                Blockchain.transfer(this._addr_A, nas2wei(this._stake) * 2);
            }else{
                Blockchain.transfer(this._addr_B, nas2wei(this._stake) * 2);
            }
        }else if (this._state == 4){
            Blockchain.transfer(this._addr_B, nas2wei(this._stake) * 2);
        }else if (this._state == 5){
            Blockchain.transfer(this._addr_A, nas2wei(this._stake) * 2);
        }else{
            throw new Error("error");
            return 1;
        }

        this._state = 0;
        this._addr_A = null;
        this._addr_B = null;
        this._hidden_A = null;
        this._hidden_B = null;
        this._revealed_A = null;
        this._revealed_B = null;
        return 0;
    },  

    _process_4: function(revealed){
        // B reveal, correct -> send 2x to B
        // B reveal, wrong -> send back to A and B
        this.check_state(4);
        
        var source = Blockchain.transaction.from;
        if (source == this._addr_B){
            if( MD5(revealed) == this._hidden_B){
                Blockchain.transfer(this._addr_B, nas2wei(this._stake) * 2);
            }else{
                Blockchain.transfer(this._addr_A, nas2wei(this._stake));
                Blockchain.transfer(this._addr_B, nas2wei(this._stake));
            }
            this._state = 0;
            return 0;
        }else{
            throw new Error("error");
            return 1;
        }
    },

    _process_5: function(revealed){
        // A reveal, correct -> send 2x to A
        // A reveal, wrong -> send back to A and B
        this.check_state(5);
        
        var source = Blockchain.transaction.from;
        if (source == this._addr_A){
            if( MD5(revealed) == this._hidden_A){
                Blockchain.transfer(this._addr_A, nas2wei(this._stake) * 2);
            }else{
                Blockchain.transfer(this._addr_A, nas2wei(this._stake));
                Blockchain.transfer(this._addr_B, nas2wei(this._stake));
            }
            this._state = 0;
            return 0;
        }else{
            throw new Error("error");
            return 1;
        }
    },

    process: function(text){
        // state 1: timeout, send back to A
        // state 2,4,5: timeout, send back to A and B
        // state 3: timeout, send 2x to the one already revealed

        var current_height = Blockchain.block.height;
        if(this._state != 0 && current_height > this._last_block + this._stale){
            if(this._state == 1){
                Blockchain.transfer(this._addr_A, nas2wei(this._stake));
                this._state = 0;
            }else if(this._state == 3){
                if(this._revealed_A == null){
                    // A is wrong
                    Blockchain.transfer(this._addr_B, 2*nas2wei(this._stake));
                    this._state = 0;
                }else{
                    // B is wrong
                    Blockchain.transfer(this._addr_A, 2*nas2wei(this._stake));
                    this._state = 0;
                }
            }else{
                // both is wrong
                Blockchain.transfer(this._addr_A, nas2wei(this._stake));
                Blockchain.transfer(this._addr_B, nas2wei(this._stake));
                this._state = 0;
            }

            this._state = 0;
            this._addr_A = null;
            this._addr_B = null;
            this._hidden_A = null;
            this._hidden_B = null;
            this._revealed_A = null;
            this._revealed_B = null;

            return 0;
        }

        if(this._state >= 0 && this._state <= 5){

            var res = null;
            var state = this._state;

            if (state == 0){
                res = this._process_0(text);
            } else if (state == 1){
                res = this._process_1(text);
            } else if (state == 2){
                res = this._process_2(text);
            } else if (state == 3){
                res = this._process_3(text);
            } else if (state == 4){
                res = this._process_4(text);
            } else if (state == 5){
                res = this._process_5(text);
            }

            if(res == 0){
                this._last_block = Blockchain.block.height;
            }
            return res;
        }
        
    },

    _winner_A: function(A,B){
        if(A == B){
            return true;
        }else{
            return false;
        }
    },


    // the last char of a string
    lastcharof: function(text){
        return text.charAt(text.length-1);
    },

    
    // following are getters

    name: function () {
        return this._name;
    },

    creator: function () {
        return this._creator;
    },

    stake: function () {
        return this._stake;
    },

    stale: function () {
        return this._stale;
    },

    state: function () {
        return this._state;
    },

    last_block: function () {
        return this._last_block;
    },

    addr_A: function () {
        return this._addr_A;
    },

    hidden_A: function () {
        return this._hidden_A;
    },

    revealed_A: function () {
        return this._revealed_A;
    },

    addr_B: function () {
        return this._addr_B;
    },

    hidden_B: function () {
        return this._hidden_B;
    },

    revealed_B: function () {
        return this._revealed_B;
    }
};

module.exports = Game;
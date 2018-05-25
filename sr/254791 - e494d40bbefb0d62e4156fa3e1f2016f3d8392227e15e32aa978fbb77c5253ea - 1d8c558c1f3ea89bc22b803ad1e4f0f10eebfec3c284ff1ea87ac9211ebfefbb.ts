class LongestPalindromic {
    constructor() {}
    init() {}
    get(s: string) {
        let key = s.trim()
        if (key === '' || !key) {
            throw new Error('empty find sting is not allowed!')
        }
        var result,
            begin = 0,
            max = -1,
            newS = '%' + s.split('').join('%') + '%'
        for (var i = 0; i < newS.length; i++) {
            if (this._my(newS, i - max - 1, i)) {
                begin = i - max - 1
                max += 2
            }
        }
        var maxS = newS.substr(begin, max)
        if (maxS[0] === '%') {
            var maxS2 = maxS.substr(1, maxS.length - 2)
            result = maxS2.split('%').join('')
            return result
        } else {
            result = maxS.split('%').join('')
            return result
        }
    }

    _my(s, begin, end) {
        while (begin < end && s[begin] === s[end]) {
            ++begin
            --end
        }
        return begin - end === 1 || begin === end
    }
}
module.exports = LongestPalindromic
// n1sJbzaEvb6TDLfJZ3DiRE5JU97kkCnp1jw
// 7d3076e02903420abea678f60d62228e7248b5a204886bce6d8d05aa952c389e
var TexContract = function() {}

TexContract.prototype = {
    init: function() {},

    saveTex: function(tex) {
        if (Blockchain.transaction.value > 0)
            throw Error("Please don't send me money")

        if (!tex || tex.trim().length === 0) throw Error('No tex sent to store')

        LocalContractStorage.set(Blockchain.transaction.hash, tex)
    },

    loadTex: function(hash) {
        return LocalContractStorage.get(hash)
    },
}

module.exports = TexContract

var Renting = function(text) {
    if(text){
        var obj = JSON.parse(text);

        this.author = obj.author;
        this.region = obj.region;
        this.describe = obj.describe;
    }
}

Renting.prototype = {
    toString : function(){
        return JSON.stringify(this);
    }
}

TheRenting = function(){
    LocalContractStorage.defineMapProperty(this, "RentingsMap", {
        parse: function(text){
            return new Renting(text);
        },
        stringify: function(o){
            return o.toString();
        }
    })
}

TheRenting.prototype = {
    init: function(){},

    set: function(region, describe){
        if(!region || !describe){
            throw new Error("empty region or describe")
        }

        if(region.length > 50 || describe.length > 500){
            throw new Error("region or describe  exceed limit length")
        }

        var renting = this.RentingsMap.get(region);

        if(renting){
            throw new Error("letter has been occupied");
        }

        var from = Blockchain.transaction.from;
        renting = new Renting();
        renting.author = from;
        renting.region = region;
        renting.describe = describe;

        this.RentingsMap.set(region, renting);
    },

    get: function(region){
        if(!region){
            throw new Error("empty region")
        }

        return this.RentingsMap.get(region);
    }
}

module.exports = TheRenting;
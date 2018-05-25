'use strict'

var BarCode = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.barcodetitle = obj.barcodetitle;
        this.barcodecontent = obj.barcodecontent;
        this.author = obj.author;
    }
};

BarCode.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheBarCode = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new BarCode(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheBarCode.prototype ={
    init:function(){

    },

    save:function(barcodetitle,barcodecontent){
        if(!barcodetitle || !barcodecontent){
            throw new Error("empty barcodetitle or barcodecontent")
        }

        if(barcodetitle.length > 20 || barcodecontent.length > 500){
            throw new Error("BarCode or barcodecontent  exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var barCode = this.data.get(barcodetitle);
        if(barCode){
            throw new Error("barCode has been occupied");
        }

        barCode = new BarCode();
        barCode.author = from;
        barCode.barcodetitle = barcodetitle;
        barCode.barcodecontent = barcodecontent;

        this.data.put(barcodetitle,barCode);
    },

    get:function(barcodetitle){
        if(!barcodetitle){
            throw new Error("empty BarCodeTitle")
        }
        return this.data.get(barcodetitle);
    }
}

module.exports = TheBarCode;
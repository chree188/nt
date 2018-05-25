'use strict'

var ShareTxt = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.bttitle = obj.bttitle;
        this.btarea = obj.btarea;
        this.author = obj.author;
    }
};

ShareTxt.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheShareTxt = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new ShareTxt(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheShareTxt.prototype ={
    init:function(){

    },

    save:function(bttitle,btarea){
        if(!bttitle || !btarea){
            throw new Error("empty bttitle or btarea")
        }

        if(bttitle.length > 20 || btarea.length > 500){
            throw new Error("bttitle or btarea  exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var shareBt = this.data.get(bttitle);
        if(shareBt){
            throw new Error("shareBT has been occupied");
        }

        shareBt = new ShareTxt();
        shareBt.author = from;
        shareBt.bttitle = bttitle;
        shareBt.btarea = btarea;

        this.data.put(bttitle,shareBt);
    },

    get:function(bttitle){
        if(!bttitle){
            throw new Error("empty bttitle")
        }
        return this.data.get(bttitle);
    }
}

module.exports = TheShareTxt;
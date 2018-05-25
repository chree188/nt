
`use strict`
var Account = function(obj){
    this.imagesHashs =[]
    if(typeof obj != "undefined"){
        obj = JSON.parse(obj)
        if(Object.prototype.toString.call(obj) == '[object Array]')
            this.imagesHashs = obj;
    }
}

Account.prototype={
    toString: function(){
        return JSON.stringify(this.imagesHashs);
    },
    addImageHash:function(imageHash){
        for (var i = 0 ;i < this.imagesHashs.length; ++i){
            if(imageHash==this.imagesHashs[i]) return;
        }
        this.imagesHashs.push(imageHash);

    },
    removeImageHash:function(imageHash){

        for(var i = 0;i < this.imagesHashs.length; ++i){
            if(imageHash == this.imagesHashs[i]){
                this.imagesHashs.splice(i,1);
                return ;
            }
        }
    }
}

var imageInfo = function(obj){
    if (typeof obj === 'string'){
        obj = JSON.parse(obj)
    }
    if(typeof obj === "object"){

        this.owner = obj.owner;
        this.mark = obj.mark;
        this.time = obj.time;
    }else{

        this.owner = ""
        this.mark = ""
        this.time = ""
    }
}

imageInfo.prototype={
    toString:function(){
        return JSON.stringify(this);
    }
}

var superImages = function(){
    LocalContractStorage.defineProperties(this,{
        _name:null,
        _creater:null,
    });

    LocalContractStorage.defineMapProperties(this,{

        "imageInfos":{

            parse: function(value){
                return new imageInfo(value);
            },
            stringify: function(o){
                return o.toString();
            }
        },

        "accounts":{
            parse:function(value){
                return new Account(value);
            },
            stringify:function(o){
                return o.toString();
            }
        }

    })
}
superImages.prototype={

    init: function(){
        this._creater = Blockchain.transaction.from;
        this._name = "weChat: dawang1048258";
    },
    name:function(){
        return this._name;
    },

    listByOwner:function(owner){
        return this.accounts.get(owner) || [];
    },

  
    pushImageHash:function(imageHash,mark){
        if(!!this.imageInfos.get(imageHash))
            throw new Error("imageHash has add don't push again!")

        var from = Blockchain.transaction.from;

        var imagexq = new imageInfo({
            "owner":from,
            "mark":mark,
            "time":Blockchain.transaction.timestamp.toString(10),
        });


        this.imageInfos.set(imageHash,imagexq);
        var account = this.accounts.get(from) || new Account();

        account.addImageHash(imageHash);
        this.accounts.set(from,account);
    },
   

    getImageinfo:function(imageHash){

        var hashinfo = this.imageInfos.get(imageHash);
        if(!hashinfo)
            throw new Error("Cant't find the image");

        return hashinfo;
    },

     shiftImageHas:function(imageHash){

        var hashinfo = this.imageInfos.get(imageHash);
        if(!hashinfo) 
        throw new Error(" Can't find the image")
        var from = Blockchain.transaction.from;

        if(hashinfo.owner != from){
            throw new Error("The image is'not belone you !");
        }
        this.imageInfos.delete(imageHash);

        var account = this.accounts.get(from);

        if(account){
            account.removeImageHash(imageHash);
            this.accounts.set(from,account);
        }


    },

    transfer:function(to,imageHash){
        var from = Blockchain.transaction.from;
        var info = this.imageInfos.get(imageHash)
        if(!info){
            throw new Error ("Cant't find the image")
        }
        if(info.owner != from)
            throw new Error("the image don't belone you")


            info.owner = to;
        this.imageInfos.set(imageHash,info);

       var account = this.accounts.get(from);

       if(account){
           account.removeImageHash(imageHash);
           this.accounts.set(from)
       }

       account = this.accounts.get(to) || new Account();

       account.addImageHash(imageHash);
       this.accounts.set(to,account);
    
    }
       


}

module.exports = superImages; 
'use strict'

var ImageItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.author = obj.author;
    }else{
        this.key = '';
        this.author = '';
        this.value = '';
    }
}


ImageItem.prototype = {
    toString: function(){
        return JSON.stringify(this);
    }
}

var ImageStorage = function(){
    LocalContractStorage.defineMapProperty(this, 'repo', {
        parse: function(text){
            return new ImageItem(text);
        },
        stringify: function(o){
            return o.toString();
        }
    })
}

ImageStorage.prototype = {
    init: function(){
        //
    },

    save: function(key, value){
        if(key === '' || value === ""){
            throw new Error("empty key / value")
        }
        if (value.length > 128 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var imageItem = this.repo.get(key)

        if (imageItem){
            throw new Error("value has been occupied");
        }

        imageItem = new ImageItem();
        imageItem.author = from;
        imageItem.key = key;
        imageItem.value = value;

        this.repo.put(key, imageItem)
    },

    get: function(key){
        key = key.trim();
        if (key === ""){
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
}

module.exports = ImageStorage;
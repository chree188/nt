'use strict'

var PersonItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.title = obj.title;
        this.author = obj.author
        this.labels = obj.labels
    }
};

PersonItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var ThePerson = function () {
    /*
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new PersonItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });*/
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap",{
        parse: function (text) {
            return new PersonItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });


    LocalContractStorage.defineProperty(this, "size");
};

ThePerson.prototype ={
    init:function(){
        this.size = 0;
    },

    save:function(title,content){
        if(!title){
            throw new Error("empty title or content")
        }

        if(title.length > 20 ){
            throw new Error("title or content  exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var personItem = this.dataMap.get(title);
        if(personItem){
            throw new Error("letter has been occupied");
        }

        personItem = new PersonItem();
        personItem.author = from;
        personItem.title = title;
        personItem.labels = {}

        var index = this.size;
        this.arrayMap.set(index, title);
        this.dataMap.set(title, personItem);
        this.size +=1;

        return index

        //this.data.put(title,personItem);
    },

    get:function(title){
        if(!title){
            throw new Error("empty title")
        }
        return this.dataMap.get(title);
    },

    len:function(){
        return this.size;
    },

    comment:function(title,text){
        if(!title || !text){
            throw new Error("empty title or content")
        }

        if(title.length > 20 || text.length>20){
            throw new Error("title or content  exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var personItem = this.dataMap.get(title)
        var labels = personItem.labels
        if(text in labels){
            personItem.labels[text] += 1
        }
        else{
            personItem.labels[text] = 1
        }
        this.dataMap.set(title, personItem);
        return {"info":"success"}

    },

    forEach: function(limit, offset){

        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
            throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
            number = this.size;
        }
        var result  = [];


        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result.push(object)
        }
        return result



        return {"a":"b"};
    }
}

module.exports = ThePerson;
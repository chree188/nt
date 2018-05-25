'use strict'

var LszBlogItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.title = obj.title;
        this.content = obj.content;
        this.author = obj.author;
    }
};

LszBlogItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheLszBlog = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new LszBlogItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheLszBlog.prototype ={
    init:function(){
        
    },

    save:function(title,content){
        if(!title || !content){
            throw new Error("empty title or content")
        }

        if(title.length > 20 || content.length > 500){
            throw new Error("title or content  exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var lszBlogItem = this.data.get(title);
        if(lszBlogItem){
            throw new Error("blog has been occupied");
        }

        lszBlogItem = new LszBlogItem();
        lszBlogItem.author = from;
        lszBlogItem.title = title;
        lszBlogItem.content = content;

        this.data.put(title,lszBlogItem);
        return lszBlogItem;
    },

    get:function(title){
        if(!title){
            throw new Error("empty title")
        }
        return this.data.get(title);
    }
}

module.exports = TheLszBlog;
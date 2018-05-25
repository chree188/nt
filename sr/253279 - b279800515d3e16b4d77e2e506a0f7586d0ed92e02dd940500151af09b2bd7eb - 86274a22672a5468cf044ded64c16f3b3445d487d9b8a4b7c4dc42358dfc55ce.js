"use strict";

var Util = {
    extend: function extend (object) {
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, source; source = args[i]; i++) {
            if (!source) continue;
            for (var property in source) {
                object[property] = source[property];
            }
        }
        return object;
    }
};

var Comment = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.id = o.id;
        this.address = o.address;
        this.content = o.content;
        this.date = o.date;
    } else {
        this.id = '';
        this.address = '';
        this.content = '';
        this.date = '';
    }
};

Comment.prototype.toString = function () {
    return JSON.stringify(this);
};

var Article = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.id = o.id;
        this.title = o.title;
        this.excerpt = o.excerpt;
        this.content = o.content;
        this.tags = o.tags;
        this.date = o.date;
        this.comments = o.comments;
    } else {
        this.id = '';
        this.title = '';
        this.excerpt = '';
        this.content = '';
        this.tags = [];
        this.date = '';
        this.comments = [];
    }
};

Article.prototype.toString = function () {
    return JSON.stringify(this);
};



function Blog() {

    LocalContractStorage.defineMapProperty(this, "articles", {
        parse: function (text) {
            return new Article(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperties(this, {
        size: 0
    });

}

Blog.prototype.init = function () {
    this.size = 0;
};

Blog.prototype.len = function () {
    return this.size;
};

Blog.prototype.post = function (title , excerpt, content, tags , date) {
    var index = this.size;

    var article = new Article();

    article.title = title;
    article.excerpt = excerpt;
    article.content = content;
    article.tags = [];
    article.date = date;
    article.id = index + '';

    this.articles.put(article.id, article);
    this.size = this.size + 1;
    return article;
};

Blog.prototype.put = function (id, title , excerpt, content, tags , date) {
    var article = this.articles.get(id);

    if(!article){
        throw new Error("article empty id:"+id);
    }

    if(title){
        article.title = title;
    }
    if(excerpt){
        article.excerpt = excerpt;
    }
    if(content){
        article.content = content;
    }
    if(date){
        article.date = date;
    }

    this.articles.put(article.id, article);
    return article;
};

Blog.prototype.append = function (id, content) {
    var article = this.articles.get(id);
    if(!article){
        throw new Error("article empty id:"+id);
    }
    article.content = article.content + content;
    this.articles.put(article.id, article);
    return article;
};

Blog.prototype.list = function (page, max) {

    page = parseInt(page);
    max = parseInt(max);

    var size = this.size;
    var list = [];

    var total = Math.ceil(size/max);

    var start = page * size;
    var end = page * size + max;
    end = (end > size)? size : end;

    for(var i=start;i<end;i++){
        var article = this.articles.get(i);
        var new_article = {
            id:article.id,
            title:article.title,
            excerpt:article.excerpt,
            tags:article.tags,
            date:article.date
        };
        article && list.push( new_article );
    }

    return {
        total: total,
        page: page,
        start: start,
        end: end,
        list: list
    };
};

Blog.prototype.get = function (index) {
    var article = this.articles.get(index);

    if(!article){
        return article;
    }

    var new_article = {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        tags: article.tags,
        date: article.date
    };

    return new_article;
};

Blog.prototype.comment = function (aid, comment, date) {
    var article = this.articles.get(aid);

    if(!article){
        throw new Error("article empty id:"+aid);
    }

    if(comment){
        var from = Blockchain.transaction.from;
        var c = new Comment();
        c.content = comment;
        c.date = date;
        c.address = from;
        c.id = article.comments.length;
        article.comments.push(c);
    }

    this.articles.put(article.id, article);
    return article;
};

Blog.prototype.comments = function (aid) {
    var article = this.articles.get(aid);
    if(!article){
        throw new Error("article empty id:"+aid);
    }
    return article.comments;
};

module.exports = Blog;

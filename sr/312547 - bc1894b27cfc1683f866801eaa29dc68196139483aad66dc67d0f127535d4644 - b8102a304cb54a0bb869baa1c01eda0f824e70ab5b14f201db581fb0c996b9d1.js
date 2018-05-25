'use strict';

var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

var Comment = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.author = obj.author;
    this.text = obj.text;
    this.datetime = new Date(obj.datetime);
    this.comment_id = obj.comment_id;
  } else {
    this.author = "";
    this.text = "";
    this.datetime = new Date();
    this.comment_id = 0;
  }
};

var User = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.comments = obj.comments;
    this.name = obj.name;
    this.address = obj.address;
    this.email = obj.email;
    this.registration_date = obj.registration_date;
  } else {
    this.comments = [];
    this.name = "";
    this.address = "";
    this.email = "";
    this.registration_date = new Date();
  }
};

var WebPage = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.url = obj.url;
    this.comments = obj.comments;
    this.website_id = obj.website_id;
  } else {
    this.url = "";
    this.comments = [];
    this.website_id = 0;
  }
};

var WebSite = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.domain = obj.domain;
    this.admin = obj.admin;
    this.id = new BigNumber(obj.id);
  } else {
    this.domain = "";
    this.admin = "";
    this.id = new BigNumber(0);
  }
};

Comment.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

WebPage.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

WebSite.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

User.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var Nascom = function () {
  LocalContractStorage.defineProperty(this, 'last_comment_id');
  LocalContractStorage.defineProperty(this, 'last_website_id');
  LocalContractStorage.defineProperty(this, 'new_website_price');
  LocalContractStorage.defineProperty(this, 'root');
  LocalContractStorage.defineMapProperty(this, "comments", {
      parse: function (text) {
          return new Comment(text);
      },
      stringify: function (o) {
          return o.toString();
      }
  });
  LocalContractStorage.defineMapProperty(this, "users", {
      parse: function (text) {
          return new User(text);
      },
      stringify: function (o) {
          return o.toString();
      }
  });
  LocalContractStorage.defineMapProperty(this, "webpages", {
      parse: function (text) {
          return new WebPage(text);
      },
      stringify: function (o) {
          return o.toString();
      }
  });
  LocalContractStorage.defineMapProperty(this, "websites", {
      parse: function (text) {
          return new WebSite(text);
      },
      stringify: function (o) {
          return o.toString();
      }
  });

};

Nascom.prototype = {
  init: function () {
    this.last_comment_id = 0;
    this.last_website_id = 0;
    this.new_website_price = new BigNumber(1000000000000000000);
    this.root = Blockchain.transaction.from;
  },

  set_website_price: function(price){
    if(Blockchain.transaction.from === this.root){
        this.new_website_price = new BigNumber(price);
        return {"success": true};
    }else{
      return {"success": false, "message": "Only for root"};
    }
  },

  _replaceTag: function(tag) {
      return tagsToReplace[tag] || tag;
  },

  _safe_tags_replace: function(str) {
      return str.replace(/[&<>]/g, this._replaceTag);
  },
  add_comment: function(text, url){

    var webpage = this.webpages.get(url);
    if(!webpage){
      var webpage = new WebPage();
      webpage.url = url;
      this.webpages.put(url, webpage);
    }

    var comment_id = ++this.last_comment_id;
    var comment = new Comment();
    comment.author = Blockchain.transaction.from;
    comment.text = this._safe_tags_replace(text);
    comment.comment_id = comment_id;

    webpage.comments.push(comment);
    this.webpages.put(url, webpage);
    
    return {"success": true, "message": "Comment saved"};
  },

  remove_comment: function(url, website_id, comment_id){
    var website = this.websites.get(website_id);
    if(website.admin != Blockchain.transaction.from && this.root != Blockchain.transaction.from){
      return {"success": false, "message": "You are not admin"};      
    }

    var webpage = this.webpages.get(url);
    if(!webpage){
      var webpage = new WebPage();
      webpage.url = url;
      this.webpages.put(url, webpage);
      return {"success": false, "message": "No comments"};
    }
    webpage.comments.forEach(function(item, index, object) {
      if (item.comment_id === comment_id) {
        object.splice(index, 1);
      }
    });
    this.webpages.put(url, webpage);
    return {"success": true, "webpage":this.webpages.get(url)};
  },

  save_userinfo: function(name, email){
    var user = new User();
    user.name = this._safe_tags_replace(name);
    user.email = email;
    user.address = Blockchain.transaction.from;
    this.users.put(Blockchain.transaction.from, user);    
    return {"success": true, "message": "Info saved"};
  },

  add_website: function(domain){
    if(new BigNumber(Blockchain.transaction.value) >= this.new_website_price){
      var website = new WebSite();
      website.domain = domain;
      website.admin = Blockchain.transaction.from;
      website.id = ++this.last_website_id;

      var added = this.websites.put(website.id, website);
      Blockchain.transfer(this.root, Blockchain.transaction.value);
      return {"success": true, "message": "Website saved", "website_id": website.id};
    }else{
      return {"success": false, "message": "New website costs "+ this.new_website_price.toString() + " wei"};
    }    
  },

  get_userinfo: function(address){
    return this.users.get(address);
  },

  get_websiteinfo: function(domain, id){
    var website = this.websites.get(id);
    if(website.domain == domain){
      return website;
    }else{
      return {"success": false, "message": "Error"};
    }
  },

  get_comments: function(url, id){
    var webpage = this.webpages.get(url);
    if(!webpage){
      var webpage = new WebPage();
      webpage.url = url;
      this.webpages.put(url, webpage);
    }

    var webpage = this.webpages.get(url);

    var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    var domain = matches && matches[1];
    return {"success": true, "comments": webpage.comments};
  },
};
module.exports = Nascom;
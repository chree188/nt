// @TODO hide posts with -15
// @TODO hide watched posts (switch)

'use strict';

var PostContent = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.image = obj.image;
    this.author = obj.author;
    this.rating = new BigNumber(obj.rating);
  } else {
    this.image = "";
    this.author = "";
    this.rating = new BigNumber(0);
  }
};

var UserContent = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.weight = new BigNumber(obj.weight);
    this.posts = obj.posts;
  } else {
    this.weight = new BigNumber(0);
    this.posts = [];
  }
};

PostContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

UserContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var NasWay = function () {
  LocalContractStorage.defineProperty(this, 'last_id');
  LocalContractStorage.defineProperty(this, 'root_comission');
  LocalContractStorage.defineProperty(this, 'root');
  LocalContractStorage.defineProperty(this, 'admin');
  LocalContractStorage.defineProperty(this, 'admin_price');
  LocalContractStorage.defineMapProperty(this, "feed", {
      parse: function (text) {
          return new PostContent(text);
      },
      stringify: function (o) {
          return o.toString();
      }
  });
  LocalContractStorage.defineMapProperty(this, "users", {
      parse: function (text) {
          return new UserContent(text);
      },
      stringify: function (o) {
          return o.toString();
      }
  });
};

NasWay.prototype = {
  init: function () {
    var post = new PostContent();
    post.image = "https://upload.wikimedia.org/wikipedia/en/7/7d/Lenna_%28test_image%29.png";
    post.author = Blockchain.transaction.from;
    this.feed.put(1, post);
    var post = new PostContent();
    post.image = "http://img1.joyreactor.cc/pics/post/%D1%82%D1%8F%D0%BD-%D0%B0%D0%B2%D1%82%D0%BE%D0%BC%D0%BE%D0%B1%D0%B8%D0%BB%D1%8C-%D0%B2%D0%BE%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5-4467265.jpeg";
    post.author = Blockchain.transaction.from;
    this.feed.put(2, post);
    var post = new PostContent();
    post.image = "https://cs10.pikabu.ru/post_img/2018/05/12/4/1526102588135974334.jpg";
    post.author = Blockchain.transaction.from;
    this.feed.put(3, post);
    var post = new PostContent();
    post.image = "http://img0.joyreactor.cc/pics/post/%D0%B3%D0%B8%D1%84%D0%BA%D0%B8-%D0%B0%D0%B7%D0%B8%D0%B0%D1%82%D1%81%D0%BA%D0%B8%D0%B5-%D0%B2%D1%8B%D0%B4%D1%83%D0%BC%D1%89%D0%B8%D0%BA%D0%B8-%D1%84%D0%BE%D0%BA%D1%83%D1%81-%D0%B1%D0%BE%D0%BB%D1%8C%D1%88%D0%B0%D1%8F-%D0%B3%D0%B8%D1%84%D0%BA%D0%B0-4467130.gif";
    post.author = Blockchain.transaction.from;
    this.feed.put(4, post);
    var post = new PostContent();
    post.image = "http://img1.joyreactor.cc/pics/post/%D0%B0%D0%B7%D0%B8%D0%B0%D1%82%D1%81%D0%BA%D0%B8%D0%B5-%D0%B2%D1%8B%D0%B4%D1%83%D0%BC%D1%89%D0%B8%D0%BA%D0%B8-%D0%B3%D0%B8%D1%84-%D0%9F%D0%BB%D0%B0%D0%BD%D1%88%D0%B5%D1%82-4457499.gif";
    post.author = Blockchain.transaction.from;
    this.feed.put(5, post);
    var post = new PostContent();
    post.image = "http://img1.joyreactor.cc/pics/post/%D0%B3%D0%B8%D1%84%D0%BA%D0%B8-%D0%B0%D0%B7%D0%B8%D0%B0%D1%82%D1%81%D0%BA%D0%B8%D0%B5-%D0%B2%D1%8B%D0%B4%D1%83%D0%BC%D1%89%D0%B8%D0%BA%D0%B8-4445819.gif";
    post.author = Blockchain.transaction.from;
    this.feed.put(6, post);
    var post = new PostContent();
    post.image = "http://img0.joyreactor.cc/pics/post/%D0%B1%D0%BE%D0%BB%D1%8C%D1%88%D0%B8%D0%B5-%D0%B3%D0%B8%D1%84%D0%BA%D0%B8-%D0%B3%D0%B8%D1%84%D0%BA%D0%B8-%D0%B0%D0%B7%D0%B8%D0%B0%D1%82%D1%81%D0%BA%D0%B8%D0%B5-%D0%B2%D1%8B%D0%B4%D1%83%D0%BC%D1%89%D0%B8%D0%BA%D0%B8-%D1%8F%D0%B1%D0%BB%D0%BE%D0%BA%D0%BE-4413436.gif";
    post.author = Blockchain.transaction.from;
    this.feed.put(7, post);
    var post = new PostContent();
    post.image = "http://img1.joyreactor.cc/pics/post/%D1%82%D1%80%D1%8E%D0%BA%D0%B8-%D0%A3%D0%BB%D0%B8%D1%87%D0%BD%D0%B0%D1%8F-%D0%BC%D0%B0%D0%B3%D0%B8%D1%8F-%D0%B3%D0%B8%D1%84%D0%BA%D0%B8-%D0%B0%D0%B7%D0%B8%D0%B0%D1%82%D0%BA%D0%B0-4321795.gif";
    post.author = Blockchain.transaction.from;
    this.feed.put(8, post);
    var post = new PostContent();
    post.image = "http://img0.joyreactor.cc/pics/post/%D0%B3%D0%B8%D1%84%D0%BA%D0%B8-%D0%B4%D0%B5%D0%B2%D1%83%D1%88%D0%BA%D0%B0-%D0%B0%D0%B7%D0%B8%D0%B0%D1%82%D0%BA%D0%B0-%D0%B0%D1%80%D0%B1%D1%83%D0%B7-4077118.gif";
    post.author = Blockchain.transaction.from;
    this.feed.put(9, post);
    var post = new PostContent();
    post.image = "http://img0.joyreactor.cc/pics/post/%D0%B4%D0%BB%D1%8F-%D0%B2%D0%B0%D0%B6%D0%BD%D1%8B%D1%85-%D0%BF%D0%B5%D1%80%D0%B5%D0%B3%D0%BE%D0%B2%D0%BE%D1%80%D0%BE%D0%B2-gifs-%D0%B0%D0%B7%D0%B8%D0%B0%D1%82%D0%BA%D0%B0-%D0%BF%D0%B5%D1%81%D0%BE%D1%87%D0%BD%D0%B8%D1%86%D0%B0-4008180.gif";
    post.author = Blockchain.transaction.from;
    this.feed.put(10, post);
    var post = new PostContent();
    post.image = "http://img0.joyreactor.cc/pics/post/%D0%B3%D0%B8%D1%84%D0%BA%D0%B8-%D0%B0%D0%B7%D0%B8%D0%B0%D1%82%D0%BA%D0%B8-%D0%B4%D0%B5%D0%B2%D1%83%D1%88%D0%BA%D0%B8-3923876.gif";
    post.author = Blockchain.transaction.from;
    this.feed.put(11, post);
    var post = new PostContent();
    post.image = "http://img0.joyreactor.cc/pics/post/%D0%B0%D0%B7%D0%B8%D0%B0%D1%82%D0%BA%D0%B0-%D0%B4%D0%B5%D0%B2%D1%83%D1%88%D0%BA%D0%B0-%D0%BD%D1%8F%D1%88%D0%BA%D0%B0-%D1%84%D0%BE%D1%80%D0%BC%D0%B0-3802758.jpeg";
    post.author = Blockchain.transaction.from;
    this.feed.put(12, post);
    this.last_id = 12;
    this.root_comission = 50;
    this.root = "n1GsLVx6o7PrwhMuCPH3Bnwj46Sn6KdCVY8";
    this.admin_price = new BigNumber(1000000000000000000);
  },

  get_admins: function(){
    return [this.root, this.admin];
  },

  set_commission: function(commission){
    if(Blockchain.transaction.from === this.root){
      if(commission <= 100){
        this.root_comission = new BigNumber(commission);
        return {"success": true};    
      }else{
        return {"success": false, "message": "Maximum is 100"};
      }
    }else{
      return {"success": false, "message": "Permission denied"};      
    }
  },

  set_admin: function(){
    if(new BigNumber(Blockchain.transaction.value) >= this.admin_price){
      this.admin = Blockchain.transaction.from;
      Blockchain.transfer(this.root, Blockchain.transaction.value);
      return {"success": true};
    }else{
      return {"success": false, "message": "Admin price is " + this.admin_price};
    }
  },

  remove: function (post_id){
    if(Blockchain.transaction.from === this.admin || Blockchain.transaction.from === this.root){
      var post = this.feed.get(post_id);
      if(post){
        if(post.id === 1){
          return {"success": false, "message": ":("};
        }
        this.feed.delete(post_id);
        return {"success": true};
      }else{
        return {"success": false, "message": "No such post"};        
      }
    }else{
      return {"success": false, "message": "Only admins can remove posts"};
    }
  },

  get_feed: function (offset = 0) {
    var amount_to_load = 10;
    var feed_posts = [];

    var begin_id = this.last_id - offset;
    if(begin_id < 1){
      return {"success": false, "message": "You've reached the bottom"};      
    }else if(begin_id < 10){
      var stop_id = 1;
    }else{
      var stop_id = begin_id - amount_to_load;
    }

    for (var i = begin_id; i >= stop_id; i--) {
      var pst = this.feed.get(i);
      if(pst){
        feed_posts.push({"id": i, "post": pst});
      }
    }

    return {"success": true, "feed": feed_posts};
  },

  get_post: function (post_id) {
    var post = this.feed.get(post_id);
    if(post){
      return {"success": true, "entity": {"id": post_id, "post": post}};
    }else{
      return {"success": false, "message": "No such post"};      
    }
  },

  add: function(image){
    if(!/^(http|https):\/\/.+\.(gif|png|jpg|jpeg)$/i.test(image)){
      return {"success": false, "message": "It is not an image"};
    }
    var post_id = new BigNumber(this.last_id).plus(1);

    var post = new PostContent();
    post.author = Blockchain.transaction.from;
    post.rating = new BigNumber(0);
    post.image = image;

    this.feed.put(post_id, post);
    this.last_id = post_id;

    return {"success": true, "message": "Image saved"};
  },

  plus: function(post_id){
    var post = this.feed.get(post_id);
    post.rating = new BigNumber(post.rating);
    post.rating = post.rating.plus(Blockchain.transaction.value);
    this.feed.put(post_id, post);

    var commission = new BigNumber(this.root_comission);
    var root_reward = new BigNumber(Blockchain.transaction.value).dividedToIntegerBy(100).times(commission);
    var author_reward = new BigNumber(Blockchain.transaction.value).minus(root_reward);
    Blockchain.transfer(this.root, root_reward);
    Blockchain.transfer(this.root, author_reward);

    return {"success": true, "message": "Image rating plused"};
  },

  minus: function(post_id){
    var post = this.feed.get(post_id);
    post.rating = new BigNumber(post.rating);
    post.rating = post.rating.minus(Blockchain.transaction.value);
    this.feed.put(post_id, post);

    Blockchain.transfer(this.root, Blockchain.transaction.value);

    return {"success": true, "message": "Image rating minused"};
  },
};
module.exports = NasWay;
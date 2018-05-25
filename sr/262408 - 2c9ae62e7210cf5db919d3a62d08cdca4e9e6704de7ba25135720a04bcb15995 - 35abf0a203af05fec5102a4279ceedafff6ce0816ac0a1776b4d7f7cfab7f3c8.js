/**
 * Created by zhqmac on 2018/5/13.
 */
"use strict";
//创建一个类
//
var MovieItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        //片名
        this.name = obj.name;
        //演员
        this.actors = obj.actors;
        //导演
        this.director = obj.director;
        //剧情
        this.describe = obj.describe;
        //封面
        this.cover = obj.cover;
        //剧照
        this.pics = obj.pics;
        //上传者
        this.author = obj.author;
        //下载链接
        this.downloadUrl = obj.downloadUrl;
    } else {
        //片名
        this.name = "";
        //演员
        this.actors = "";
        //导演
        this.director = "";
        //剧情
        this.describe = "";
        //封面
        this.cover = "";
        //剧照
        this.pics = [];
        //上传者
        this.author = "";
        //下载链接
        this.downloadUrl = "";

    }
};

MovieItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


//部署一个合约,会创建一个SuperDictionary对象,通过合约地址找到这个对象
//合约地址可以理解成合约对象存储的空间地址
//每部署一个合约就会产生一个合约地址
var Cinema = function () {
    // LocalContractStorage.defineMapProperty(this, "repo", null);
    //定义了一个SuperDictionary的属性,属性类型为字典,当前属性的名字为repo
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new MovieItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    //电影目录
    //index:影片序列号
    //name:影片名
    // index:name
    LocalContractStorage.defineMapProperty(this, "directory");
//总影片数,每次上传一部电影加1
    LocalContractStorage.defineProperty(this, "moviesCount", null)

};

Cinema.prototype = {
    //1、原型
    //2、init方法
    //3、函数以_开头,表示私有化方法
    init: function () {
        // todo
        this.moviesCount = 0;
    },
    save: function (name, actors, director, describe, cover, pics, downloadurl) {
        //.trim()去掉两边的空格
        name = name.trim();
        actors = actors.trim();
        director = director.trim();
        describe = describe.trim();
        cover = cover.trim();
        pics = pics.trim();
        downloadurl = downloadurl.trim();

        //不能为空
        if (name === "" || downloadurl === "") {
            throw new Error("影片名、下载地址不能为空");
        }
        // //长度限制小于64
        // if (value.length > 64 || key.length > 64){
        //     throw new Error("key / value exceed limit length")
        // }
//自动获取当前钱包检测到的登录钱包地址
        var from = Blockchain.transaction.from;
        var movieItem = this.repo.get(name);
        if (movieItem) {
            throw new Error("value has been occupied");
        }
        movieItem = new MovieItem();
        movieItem.name = name;
//演员
        movieItem.actors = actors;
//导演
        movieItem.director = director;
//剧情
        movieItem.describe = describe;
//封面
        movieItem.cover = cover;
//剧照
        movieItem.pics = pics;
        //下载链接
        movieItem.downloadUrl = downloadurl;

        //上传者
        movieItem.author = from;
        this.repo.put(name, movieItem);
        //将影片放到目录中
        var index = new BigNumber(this.moviesCount).plus(1);
        this.moviesCount = index;
        this.directory.put(index,name);
    },
    getMovieCount:function () {
        return this.moviesCount;
    },
    getMoives:function (index) {
        //index 页码
        //count 每页返回条数
        var count = 20;
        var movies = [];
        //起始位置
        var value = this.moviesCount-(index-1)*count;
        for (var i=value;i>=1&&i>value-count;i-- ){
            //取影片名
            var name = this.directory.get(new BigNumber(i));
            var movie = this.repo.get(name);
            movies.push(movie);
        }
        return movies;
    },

    createMovies: function (movies) {
        var moviesObj = JSON.parse(movies);
        //movies数组,里面是movie,这样可以一次存多部电影
        //上传电影
        for (var i = 0; i < moviesObj.length; i++) {
            var movie = moviesObj[i];
            //影片名做key
            var key = movie.name;
            //影片结构体做Value
            var value = movie;
            //s.trim()去掉两边的空格
            key = key.trim();
            //不能为空
            if (key.length == 0 || value.length == 0) {
                throw new Error("empty key / value");
            }

// 自动获取当前钱包检测到的登录钱包地址
            var from = Blockchain.transaction.from;
            var movieItem = this.repo.get(key);
            if (movieItem) {
                throw new Error("影片已存在");
            }

            var movieItem = new MovieItem();
            //片名
            movieItem.name = movie.name;
            //演员
            movieItem.actors = movie.actors;
            //导演
            movieItem.director = movie.director;
            //剧情
            movieItem.describe = movie.describe;
            //封面
            movieItem.cover = movie.cover;
            //剧照
            movieItem.pics = movie.pics;
            //上传者
            movieItem.author = from;
            this.repo.put(key, movieItem);
        }
    },

    get: function (key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = Cinema;

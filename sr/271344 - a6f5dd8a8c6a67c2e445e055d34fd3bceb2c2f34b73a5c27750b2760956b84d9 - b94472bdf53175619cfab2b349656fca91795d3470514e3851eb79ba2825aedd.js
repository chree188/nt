"use strict";

var Lyric = function(str) {
	if (str) {
		var obj = JSON.parse(str);
		this.text = obj.text;
        this.name = obj.name;
        this.singer=obj.singer;
        this.album=obj.album;
		this.from = obj.from;
	} else {
	    this.text = "";
	    this.name = "";
        this.singer="";
        this.album="";
	    this.from = "";
	}
};

Lyric.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var LyricChain=function(){
    LocalContractStorage.defineProperties(this, {
        builder: null,
        lyricIndex: null
    });
    LocalContractStorage.defineMapProperties(this,{ 
        addrIdToLike:null,  //addr+id ->islike
        indexToLikeCount:null   //lyricid ->likes
    });
    LocalContractStorage.defineMapProperty(this, "indexToLyric", {
        parse: function (text) {
            return new Lyric(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

LyricChain.prototype={
    init:function(){
        this.builder=Blockchain.transaction.from;
        this.lyricIndex=0;
    },
    _isBuilder:function(addr){
         if(addr!==this.builder){
             throw new Error("you have no permission")
         }
    },
    getLyricByID:function(id){
        return this.indexToLyric.get(id);
    },
    _sort:function(arr){
        arr.sort(function(a,b){
            return b.like-a.like;
        	}
        );
        return arr;
    },
    
    getBaseData:function(){
        var from=Blockchain.transaction.from;
        var result={};
        var lyrics=[];
        for (var i = 1; i <= this.lyricIndex; i++) {
            var lyric={}
            var ly=this.indexToLyric.get(i);
            lyric.id=i;
            lyric.text = ly.text;
            lyric.name=ly.name;
            lyric.singer=ly.singer;
            lyric.album=ly.album;
            lyric.from=from;
            lyric.isLiked=this.addrIdToLike.get(from+'_'+i);
            lyric.like=this.indexToLikeCount.get(i)
            lyrics.push(lyric);
        }
        //sort
        lyrics= this._sort(lyrics)
        
        result['lyrics']=lyrics;
        result['account']=from;
        return result;
    },

    likeLyric:function(id){
        var from=Blockchain.transaction.from;
        var isliked=this.addrIdToLike.get(from+'_'+id);
        if(isliked){
            throw new Error('You are already liked it!')
        }
        var lc=this.indexToLikeCount.get(id);
        if(!lc) lc=0;
        lc++;
        this.indexToLikeCount.set(id,lc);
        this.addrIdToLike.set(from+'_'+id,true);
    },

    postLyric:function(text,name,singer,album){
        text=text.trim();
        name=name.trim();
        singer=singer.trim();
        album=album.trim();
        if (text == ""||name==""){
            throw new Error("empty text/name");
        }
        if (text.length > 100||name.length>10||(singer+album).length>20 ){
            throw new Error("Lyric exceed limit length")
        }
        var from=Blockchain.transaction.from;
        
        this.lyricIndex++;
        var lyric=new Lyric();
        lyric.text=text;
        lyric.name=name;
        lyric.singer=singer;
        lyric.album=album;
        lyric.from=from;

        this.indexToLyric.set(this.lyricIndex,lyric);
        
    }
}

module.exports = LyricChain;


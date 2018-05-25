"use strict";

var BlogContent = function(title,text) {
	this.from = Blockchain.transaction.from;
	this.timestamp = Blockchain.transaction.timestamp;
	this.title = title;
	this.text = text;
};

var BloggerContract = function() {
   LocalContractStorage.defineProperty(this, "size");
   LocalContractStorage.defineMapProperty(this, "arrayMap");
};

BloggerContract.prototype = {
    init: function () {
        this.size = 0;
    },

    get_size: function(){
    	return this.size;
    },

	set:function(title,text){
		var index = this.size;
		var hash = Blockchain.transaction.hash;

		var item = new BlogContent(title, text);
		this.arrayMap.set(index, hash);
		LocalContractStorage.set(hash,item);
		
		this.size++;
        return JSON.stringify(LocalContractStorage.get(hash));
	},

	get_by_index:function(index){
		var idx = parseInt(index);
		var hash = this.arrayMap.get(idx);
		var item = LocalContractStorage.get(hash);
		return JSON.stringify({"title":item.title,"text":item.text});
	},
	get_by_author:function(from){
		var title_list = []
		var text_list = [];
		var hash = "";
		var item = null;
		for(var i=0;i<this.size;i++){
			hash = this.arrayMap.get(i);
			item = LocalContractStorage.get(hash);
			if(item.from==from) {
				title_list.push(item.title);
				text_list.push(item.text);
			}
		}
		return JSON.stringify({"title_list":title_list,"text_list":text_list});
	}
};

module.exports = BloggerContract;
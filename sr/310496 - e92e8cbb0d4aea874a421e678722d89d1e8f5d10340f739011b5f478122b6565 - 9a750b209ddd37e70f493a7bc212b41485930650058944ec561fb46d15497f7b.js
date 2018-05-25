'use strict';

var Story = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.title = obj.title; 
        this.founder = obj.founder;
        this.createtime = obj.createtime;
        this.passageSize = obj.passageSize;
		this.description = obj.description;
    } else {
        this.title = "";
        this.founder = "";
        this.createtime = 0;
        this.passageSize = 0;
		this.description = "";
    }
};

Story.prototype.toString = function() {
    return JSON.stringify(this);
};

var Passage = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.content = obj.content;
        this.auther = obj.auther;
        this.createtime = obj.createtime;
    } else {
        this.content = "";
        this.auther = "";
        this.createtime = 0;
    }
};

Passage.prototype.toString = function() {
    return JSON.stringify(this);
};

var PassageIdCollection = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.IdList = obj.IdList;
    } else {
        this.IdList = [];
    }
};

PassageIdCollection.prototype.toString = function() {
    return JSON.stringify(this);
};

var StoryChainConstract = function() {
	LocalContractStorage.defineProperty(this, "storyNum", {
		parse: function(text) {
            return parseInt(text);
        },
        stringify: function(obj) {
            return obj.toString();
        } 
	});
    LocalContractStorage.defineMapProperty(this, "storyIndexMap");
    LocalContractStorage.defineMapProperty(this, "storyMap", {
        parse: function(text) {
            return new Story(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "passageIdCollectionMap", {
        parse: function(text) {
            return new PassageIdCollection(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "passageMap", {
        parse: function(text) {
            return new Passage(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

StoryChainConstract.prototype = {
	init: function() {
        this.storyNum = 0;
    },
    getStoryNum: function() {
        return this.storyNum;
    },
	getStory: function(title) {
		title = this._validateTitle(title);
		return this.storyMap.get(title);
	},
	createStory: function(title, description) {
        title= this._validateTitle(title);
		description = this._validateDescription(description);
		if (this.storyMap.get(title)) {
            //throw new Error("Story has already existed");
			return 0;
        }
		var story = new Story();
        story.title = title;
        story.founder = Blockchain.transaction.from;
        story.createtime = new Date().getTime();
        story.passageSize = 0;
		story.description = description;
        this.storyMap.put(title, story);
		this.storyIndexMap.put(this.storyNum, title);
		this.storyNum += 1;		
		var collection = new PassageIdCollection();
        collection.IdList = [];
		this.passageIdCollectionMap.put(title, collection);
		return this.storyNum;
    },
	listStorys: function(pageSize, pageNum) {
		this._validatePageSize(pageSize);
		this._validatePageNum(pageNum);
        pageSize = parseInt(pageSize);
        pageNum = parseInt(pageNum);
		var start = (pageNum - 1) * pageSize;
		var end = pageNum * pageSize;
		if (end >= this.storyNum) {
			end = this.storyNum;
		}
		var storys = [];
        if (start > this.storyNum){
        	return storys;
        }
		var index = 0;
        for (var i = start; i < end; i++)  {
            var title = this.storyIndexMap.get(i);
            var story = this.storyMap.get(title);
            storys[index] = story;
			index += 1;
        }
        return storys;
    },
	getPassageNum: function(title) {
        title = this._validateTitle(title);
		var story = this.storyMap.get(title);
		if (!story) {
            throw new Error("Story does not exist");
        }
        return story.passageSize;
    },
	appendPassage: function(title, content) {
		title = this._validateTitle(title);
        var story = this.storyMap.get(title);
        if (!story) {
            throw new Error("Story does not exist");
        }
		content = this._validateContent(content);
        var id = this._guid();
        var passage = new Passage();
        passage.content = content;
        passage.auther = Blockchain.transaction.from;
        passage.createtime = new Date().getTime();
        this.passageMap.set(id, passage);
        var collection = this.passageIdCollectionMap.get(title);
        collection.IdList[story.passageSize] = id;
        this.passageIdCollectionMap.set(title, collection);
        story.passageSize += 1;
        this.storyMap.set(title, story);
		return story.passageSize;
    },
	listPassages: function(title, pageSize, pageNum) {
		title = this._validateTitle(title);
		this._validatePageSize(pageSize);
		this._validatePageNum(pageNum);
		pageSize = parseInt(pageSize);
        pageNum = parseInt(pageNum);
		var story = this.storyMap.get(title)
		if (!story) {
            throw new Error("Story does not exist");
        }
		var start = (pageNum - 1) * pageSize;
		var end = pageNum * pageSize;
		if (end >= story.passageSize) {
			end = story.passageSize;
		}
		var passages = [];
        if (start > story.passageSize){
        	return passages;
        }
		var collection = this.passageIdCollectionMap.get(title);
		var index = 0;
		for (var i = start; i < end; i++)  {
			var id = collection.IdList[i];
			passages[index] = this.passageMap.get(id);
			index += 1;
        }
        return passages;
	},
	_validateTitle(title) {
		if (title == undefined || title == null) {
			throw new Error("Args is unvalidated");
		}
		title = title.trim();
        if (title === "") {
            throw new Error("Story title is blank");
        }
        if (title.length > 64) {
            throw new Error("Story title is too long");
        }
		return title;
	},
	_validateContent(content) {
		if (content == undefined || content == null) {
			throw new Error("Args is unvalidated");
		}
		content = content.trim();
        if (content === "") {
            throw new Error("Passage content is blank");
        }
        if (content.length > 2048) {
            throw new Error("Passage content is too long");
        }
        if (content.length < 32) {
            throw new Error("Passage content is too short");
        }
		return content;
	},
	_validateDescription(description) {
		if (description == undefined || description == null) {
			throw new Error("Args is unvalidated");
		}
		description = description.trim();
		 if (description === "") {
            throw new Error("Story description is blank");
        }
		if (description.length > 512) {
            throw new Error("Story description is too long");
        }
        if (description.length < 32) {
            throw new Error("Story description is too short");
        }
		return description;
	},
	_validatePageSize(pageSize) {
		if (pageSize == undefined || pageSize == null || pageSize == "" || pageSize <= 0) {
			throw new Error("Args is unvalidated");
		}
	},
	_validatePageNum(pageNum) {
		if (pageNum == undefined || pageNum == null || pageNum == "" || pageNum <= 0) {
			throw new Error("Args is unvalidated");
		}
	},
	_guid: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

module.exports = StoryChainConstract;
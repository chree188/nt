"use strict";

var Story = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.start = obj.start;
    this.end = obj.end;
    this.title = obj.title;
    this.description = obj.description;
    this.id = obj.id;
  } else {
    this.start = "";
    this.end = "";
    this.title = "";
    this.description = "";
    this.id = 0;
  }
};

Story.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var LifeStoryContract = function () {
  LocalContractStorage.defineProperty(this, "storyCount");
  LocalContractStorage.defineMapProperty(this, "userStories");
  LocalContractStorage.defineMapProperty(this, "stories", {
    parse: function (text) {
      return new Story(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

//-----

LifeStoryContract.prototype = {
  init: function () {
    this.storyCount = 0;
  },

  count: function () {
    return this.storyCount;
  },

  save: function (start, end, title, description) {
    var user = Blockchain.transaction.from;
    // var price = Blockchain.transaction.value;
    var storyCount = this.count();

    var story = new Story();
    story.start = start;
    story.end = end;
    story.title = title;
    story.description = description;
    story.id = storyCount;

    this.stories.put(storyCount, story);
    this._saveUserStories(user, storyCount);

    this.storyCount = new BigNumber(storyCount).plus(1);
    return "success"
  },

  _saveUserStories: function (user, storyId) {
    var stories = this.userStories.get(user);
    stories = stories || [];
    stories.push(storyId);
    this.userStories.del(user);
    this.userStories.put(user, stories);
  },

  _getStoriessById: function (storyIds) {
    var arr = [];
    if (!storyIds || storyIds.length == 0)
      return arr;
    for (var j = 0, len = storyIds.length; j < len; j++) {
      var msg = this.stories.get(storyIds[j]);
      if (msg) {
        arr.push(msg);
      }
    }

    return arr;
  },

  getUserStories: function () {
    var user = Blockchain.transaction.from;
    var storyIds = this.userStories.get(user);
    return this._getStoriessById(storyIds);
  }


};

module.exports = LifeStoryContract;
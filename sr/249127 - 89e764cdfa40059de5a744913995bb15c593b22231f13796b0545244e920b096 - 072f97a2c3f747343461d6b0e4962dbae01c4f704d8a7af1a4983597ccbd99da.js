"use strict";

var StarItem = function (text) {
    if (text) {
        var json = JSON.parse(text);
        this.starId = json.starId;
        this.name = json.name;
        this.story = json.story;
        this.author = json.author;
        this.x = json.x;
        this.y = json.y;
    }
    else
    {
        this.starId = "";
        this.name = "";
        this.story = "";
        this.author = Blockchain.transaction.from;
        this.x = 0;
        this.y = 0;
    }
}

StarItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var GalaxyItem = function (text) {
    if (text) {
        var json = JSON.parse(text);
        this.key = json.key;
        this.name = json.name;
        this.starItems = json.starItems;
    }
    else {
        this.key = (++galaxyId).toString(); 
        this.name = "";
        this.starItems = new Array();
    }
}

GalaxyItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var StoryGalaxy = function (text) {
    if (text) {
        var json = JSON.parse(text);
        this.key = json.key;
        this.storyItems = json.storyItems;
    }
    else {
        this.key = "";
        this.storyItems = new Array();
    }
}
StoryGalaxy.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var StarContract = function () {
    //LocalContractStorage.defineMapProperty(this, "star", {
    //    parse: function (text) {
    //        return new StarItem(text);
    //    },
    //    stringify: function (o) {
    //        return o.toString();
    //    }
    //});
    LocalContractStorage.defineMapProperty(this, "galaxy", {
        parse: function (text) {
            return new GalaxyItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "storyGalaxy", {
        parse: function (text) {
            return new StoryGalaxy(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};
var starId = new Array();
var galaxyId = 0;

StarContract.prototype = {
    init: function () {
        var gName = ["太阳系", "三体", "歌者", "归零者", "流浪星系", "边缘星系"];
        var galaxyKeyArray = [];
        var allpoArray = new Array();
        for (var i = 0; i < gName.length; i++) {
            var positionArray = new Array();
            for (var s = 0; s < 40; s++) {
                var _x = Math.random() * 100;
                var _y = Math.random() * 100;
                positionArray.push({ x: _x, y: _y });
            }
            allpoArray.push(positionArray);
            galaxyKeyArray.push(this.addGalaxy(gName[i], positionArray));
        }

        //在银河系里，初始两个星球故事
        //寻找最接近中心的星球
        var offsetMinIndex = [];

        for (var j = 0; j < 7; j++)
        {
            var OffsetMinValue = 10000;
            for (var i = 0; i < allpoArray[0].length; i++)
            {
                var x = Math.abs(allpoArray[0][i].x - 50);
                var y = Math.abs(allpoArray[0][i].y - 50);
                if ((x + y) < OffsetMinValue && offsetMinIndex.indexOf((i+1)) < 0)
                {
                    OffsetMinValue = (x + y);
                    if (offsetMinIndex.length == j) {
                        offsetMinIndex.push((i + 1));
                    }
                    else {
                        offsetMinIndex[j] = (i + 1);
                    }
                }
            }
        }
        this.add(galaxyKeyArray[0] + "_" + offsetMinIndex[0], "致我家周菇凉", "感谢有你。", "你的徐老师");
        this.add(galaxyKeyArray[0] + "_" + offsetMinIndex[3], "黑暗森林", "宇宙就是一座黑暗森林，每个文明都是带枪的猎人，像幽灵般潜行于林间，轻轻拨开挡路的树枝，竭力不让脚步发出一点儿声音，连呼吸都小心翼翼...他必须小心，因为林中到处都有与他一样潜行的猎人。如果他发现了别的生命，不管是不是猎人，不管是天使还是魔鬼，不管是娇嫩的婴儿还是步履蹒跚的老人，也不管是天仙般的少女还是天神般的男神，能做的只有一件事：开枪消灭之？在这片森林中，他人就是地狱，就是永恒的威胁，任何暴露自己存在的生命都将很快被消灭。", "罗辑");
        this.add(galaxyKeyArray[0] + "_" + offsetMinIndex[6], "地球", "生命从海洋登上陆地是地球生物进化的一个里程碑，但那些上岸的鱼再也不是鱼了；同样，真正进入太空的人，再也不是人了。所以，人们，当你们打算飞向外太空再也不回头时，请千万慎重，需付出的代价比你们想象的要大得多。", "尼尔.斯科特舰长");


        this.add(galaxyKeyArray[1] + "_" + offsetMinIndex[0], "三体", "这个世界收到了你们的信息。\n我是这个世界的一个和平主义者，我首先收到信息是你们文明的幸运，警告你们：不要回答！不要回答！不要回答！！！", "监控员");
        this.add(galaxyKeyArray[1] + "_" + offsetMinIndex[1], "故事王国", "很久以前,有一个王国叫无故事王国,它一直没有故事。其实对于一个王国而言,没有故事是最好的没有故事的王国中的人民是最幸福的,因为故事就意味着曲折和灾难。无故国有一个贤明的国王、一个善良的王后和一群正直能干的大臣, 还有勤劳朴实的人民。王国的生活像镜面一样平静, 昨天像今天, 今天像明天, 去年像今年, 今年像明年, 一直没有故事。直到王子和公主长大。", "云天明");
        this.add(galaxyKeyArray[2] + "_" + offsetMinIndex[0], "歌者", "我需要一块二向箔，清理用。", "歌者-清理员");
        this.add(galaxyKeyArray[3] + "_" + offsetMinIndex[0], "归零者", "我们宇宙的总质量减少至临界值以下,宇宙将由封闭转变为开放,宇宙将在永恒的膨胀中死去,所有的生命和记忆都将死去。\n 请归还你们拿走的质量, 只把记忆体送往新宇宙。", "回归运动声明");

        this.add(galaxyKeyArray[4] + "_" + offsetMinIndex[0], "蓝色空间号", "不要返航，这里不是家！", "to章北海");

    },
    add: function (starId, name, story ,author) {

        var name = decodeURI(name);
        var story = decodeURI(story);
        var author = decodeURI(author);
        if (name === "" || story === "") {
            throw new Error("星球名称或故事不能为空");
        }
        if (name.length > 10) {
            throw new Error("星球名称不能超过10位")
        }
        if (story.length > 300)
        {
            throw new Error("故事不能超过300位");
        }

        if (author === "")
        {
            throw new Error("请填写您的昵称");
        }
        if (author.length > 10)
        {
            throw new Error("昵称不能大于10");
        }
        var starItem = new StarItem();
        starItem.starId = starId;
        starItem.name = name;
        starItem.story = story;
        starItem.author = author;

        //this.star.set(starId, starItem);

        var result = this.storyGalaxy.get(starId.split("_")[0]);
        var oldStoryGalaxy;
        if (!result) {
            oldStoryGalaxy = new StoryGalaxy();
        }
        else
        {
            oldStoryGalaxy = result;
            for (var i = 0; i < oldStoryGalaxy.storyItems.length; i++) {
                if (oldStoryGalaxy.storyItems[i].starId == starId) {
                    throw new Error("已存在该starid");
                }
                if (oldStoryGalaxy.storyItems[i].name == name) {
                    throw new Error("已存在该星球名称");
                }
            }
        }
        oldStoryGalaxy.key = starId.split("_")[0];
        oldStoryGalaxy.storyItems.push(starItem);
        this.storyGalaxy.set(starId.split("_")[0], oldStoryGalaxy);

    },
    getStoryByGalaxy: function (galaxyKey)
    {
        return this.storyGalaxy.get(galaxyKey);
    },

    get: function (starId) {
        var starId = starId.trim();
        if (starId === "") {
            throw new Error("星球ID为空")
        }
        return this.star.get(starId);
    },

    getGalaxy: function (key)
    {
        if (key === "")
        {
            throw new Error("星系key不能为空");
        }
        return this.galaxy.get(key);
    },
    //[{x:13,y:33},{x:44,y:55}]
    addGalaxy: function (name,positionArray)
    {
        var name = decodeURI(name);

        if (!positionArray)
        {
            throw new Error("星系参数不合法");
        }
        if (positionArray.length == 0)
        {
            throw new Error("星系参数长度为0");
        }
        var galaxy = new GalaxyItem();
        galaxy.name = name;
        for (var i = 0; i < positionArray.length; i++)
        {
            var starItem = new StarItem();
            starItem.starId = galaxy.key + "_" + (i + 1).toString();
            starItem.x = positionArray[i].x;
            starItem.y = positionArray[i].y;
            galaxy.starItems.push(starItem);
        }
        this.galaxy.put(galaxy.key, galaxy);
        return galaxy.key;
    }

};


function newGuid() {
    var guid = "";
    for (var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
            guid += "-";
    }
    return guid;
}
module.exports = StarContract;
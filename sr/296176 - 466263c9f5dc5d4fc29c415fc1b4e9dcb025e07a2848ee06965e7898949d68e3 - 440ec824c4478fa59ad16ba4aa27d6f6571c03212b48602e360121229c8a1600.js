"use strict";






//管理员用户可以编辑各种数据库
var SuperUserItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.OwnerAddress = obj.OwnerAddress;// user address
        this.content = obj.content;

    } else {
        this.OwnerAddress = 'n1Q4hzjn5VsdzSsA9dBysd4z8HcRaA6ik8b';
        this.content = 'init superuser';
    }
};

SuperUserItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


//普通用户信息
var UserItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.OwnerAddress = obj.OwnerAddress;// user address
        this.UserName = obj.UserName;
        this.Sex = obj.Sex;
        this.Content = obj.Content;
        this.Time = obj.Time;
		this.Level = obj.Level; //当前等级
		this.Attach = obj.Attach; //攻击力
		this.Defense = obj.Defense; //防御力
		this.HP = obj.HP;//初始血量
		this.MaxHP = obj.MaxHP; //血量上限
		this.CurrentExp = obj.CurrentExp; //当前经验
		this.CurrentMoney = obj.CurrentMoney; //当前金钱
		this.WeaponId = obj.WeaponId;  //武器ID
		this.ArmorId = obj.ArmorId;   //衣服ID
		this.ShieldId = obj.ShieldId;  //盾牌ID



    } else {
        this.OwnerAddress = '';
        this.UserName = '';
        this.Sex = '';
        this.Content = '';
        this.Time = '';
		this.Level = 1; //当前等级
		this.Attach = 10; //攻击力
		this.Defense = 10; //防御力
		this.HP = 100;//初始血量
		this.MaxHP = 100; //血量上限
		this.CurrentExp = 0; //当前经验
		this.CurrentMoney = 0; //当前金钱
		this.WeaponId = -1;  //武器ID
		this.ArmorId = -1;   //衣服ID
		this.ShieldId = -1;  //盾牌ID
    }
    
};
UserItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

//装备信息
var EquipmentItem = function (text) {

    if (text) {

        var obj = JSON.parse(text);
        this.ItemID = obj.ItemID;
        this.type = obj.type;// 1 武器 2衣服 3盾牌 4可使用物品
        this.ItemName = obj.ItemName;
        this.ItemRequireLevel = obj.ItemRequireLevel;
        this.ItemLevel = obj.ItemLevel;
        this.Attach = obj.Attach;
        this.Defense = obj.Defense;
        this.HP = obj.HP;
        this.EquipmentDesc = obj.EquipmentDesc; //装备描述
        this.Overlay = obj.Overlay; //是否可叠加
        this.IsConsumables = obj.IsConsumables; //是否为可消耗品

    } else {
        this.ItemID = -1;
        this.type = 0;// 1 武器 2衣服 3盾牌
        this.ItemName = '';
        this.ItemRequireLevel = 0;
        this.ItemLevel = 0;
        this.Attach = 0;
        this.Defense = 0;
        this.HP = 0;
        this.EquipmentDesc = ''; //装备描述
        this.Overlay = 0; //是否可叠加
        this.IsConsumables = 0; //是否为可消耗品
    }
};
EquipmentItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

//地图信息
var MapItem = function (text) {

    if (text) {
        var obj = JSON.parse(text);
        this.MapID = obj.MapID;
        this.type = obj.type;// 1 基础地图 2 藏宝地图
        this.MapName = obj.MapName;
        this.MapRequireLevel = obj.MapRequireLevel;//地图进入等级
        this.MapHighestLevel = obj.MapHighestLevel;//地图最高等级
        this.NormalMonsterId = obj.NormalMonsterId;//小怪ID
        this.BossMonsterId = obj.BossMonsterId;// BOSS ID
        this.rewardExp = obj.rewardExp; //地图奖励经验
        this.rewardMoney = obj.rewardMoney; //地图奖励金钱
        this.rewradRate = obj.rewradRate;//0-100
        this.BossRewardItemIds = obj.BossRewardItemIds; //Boss可能掉落物品
        this.BattleEndRecover = obj.BattleEndRecover; // 战斗结束恢复生命值
    } else {
        this.MapID = -1;
        this.type = 0;// 1 基础地图 2 藏宝地图
        this.MapName = '';
        this.MapRequireLevel = 0;//地图进入等级
        this.MapHighestLevel = 0;//地图最高享受等级
        this.NormalMonsterId = [-1];//小怪ID
        this.BossMonsterId = [-1];// BOSS ID
        this.rewardExp = 0; //地图奖励经验
        this.rewardMoney = 0; //地图奖励金钱
        this.rewradRate = 0;//0-100
        this.BossRewardItemIds = []; //Boss可能掉落物品
        this.BattleEndRecover = 0;// 战斗结束恢复生命值
    }
};
MapItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

//挂机数据
var BattleRecordItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.OwnerAddress = obj.OwnerAddress; //用户地址
        this.MapId = obj.MapId; //当前挂机地图
        this.RecordStartBlockNumber = obj.RecordStartBlockNumber;  //本次挂机开始块高度

    } else {
        this.OwnerAddress = ''; //用户地址
        this.MapId = -1; //当前挂机地图
        this.RecordStartBlockNumber = '';  //本次挂机开始块高度
    }
};
BattleRecordItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

//怪物数据
var MonsterItem = function (text) {

    if (text) {

        var obj = JSON.parse(text);
        this.MonsterId = obj.MonsterId;
        this.MonsterName = obj.MonsterName; //怪物名称
        this.MonsterDesc = obj.MonsterDesc; //怪物描述
        this.MonsterHP = obj.MonsterHP;//怪物血量
        this.MonsterAttach = obj.MonsterAttach;//怪物攻击
        this.MonsterDefense = obj.MonsterDefense;//怪物防御

    } else {
        this.MonsterID = -1;
        this.MonsterName = ''; //怪物名称
        this.MonsterDesc = ''; //怪物描述
        this.MonsterHP = 100;//怪物血量
        this.MonsterAttach = 10;//怪物攻击
        this.MonsterDefense = 5;//怪物防御
    }
};
MonsterItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

//背包信息
var PackageItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.OwnerAddress = obj.OwnerAddress;//拥有者地址
        this.EquipmentItemId = obj.EquipmentItemId; //道具Id
        this.EquipmentIntensifyLevel = obj.EquipmentIntensifyLevel;//强化等级
        this.ItemCount = obj.ItemCount; //物品数量。不可叠加物品数量为1

    } else {
        this.OwnerAddress = '';//拥有者地址
        this.EquipmentItemId = -1; //道具Id
        this.EquipmentIntensifyLevel = 0;//强化等级
        this.ItemCount = 0; //物品数量。不可叠加物品数量为1
    }
};
PackageItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};



var CultivateImmortalityService = function () {
    // config
    LocalContractStorage.defineProperty(this, "BattleMaxRound");
    LocalContractStorage.defineProperty(this, "LevelExps");
    LocalContractStorage.defineProperty(this, "IntensifyCostMoneys");
    LocalContractStorage.defineProperty(this, "IntensifyCostLevelBase");
    LocalContractStorage.defineProperty(this, "BossBattleRate");
    LocalContractStorage.defineProperty(this, "UserAttachIncrease");
    LocalContractStorage.defineProperty(this, "UserDefenseIncrease");
    LocalContractStorage.defineProperty(this, "UserHPIncrease");


    //size
    LocalContractStorage.defineProperty(this, "EquipmentSize");
    LocalContractStorage.defineProperty(this, "MapSize");
    LocalContractStorage.defineProperty(this, "MonsterSize");

    // address => superuser
    LocalContractStorage.defineMapProperty(this, "superaddressRepo", {
        parse: function (text) {
            return new SuperUserItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });


    // address => user
    LocalContractStorage.defineMapProperty(this, "addressRepo", {
        parse: function (text) {
            return new UserItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });

    // equipId => equip
    LocalContractStorage.defineMapProperty(this, "EquipmentRepo", {
        parse: function (text) {
            return new EquipmentItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });

    // mapId => map
    LocalContractStorage.defineMapProperty(this, "MapRepo", {
        parse: function (text) {
            return new MapItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // MonsterId =>Monster
    LocalContractStorage.defineMapProperty(this, "MonsterRepo", {
        parse: function (text) {
            return new MonsterItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });


    // address =>BattleRecord
    LocalContractStorage.defineMapProperty(this, "BattleRecordRepo", {
        parse: function (text) {
            return new BattleRecordItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });

    // address =>Package
    LocalContractStorage.defineMapProperty(this, "PackageRepo", {
        parse: function (text) {

            var result = [];
            for (var i = 0; i < items.length; i++) {
                result.push(new PackageItem(JSON.stringify(items[i])));
            }
            return result;
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });

    // 
}


CultivateImmortalityService.prototype = {
    init: function () {
        var superaddress = Blockchain.transaction.from;
        var superuser =new  SuperUserItem();
        superuser.OwnerAddress = superaddress;
        superuser.content = 'creator is best super user';
        this.superaddressRepo.put(superaddress, superuser);


        //插入新手村怪物
        var monsterItem =new   MonsterItem();
        monsterItem.MonsterId = 1;
        monsterItem.MonsterName = '小野猪'; //怪物名称
        monsterItem.MonsterDesc = '据说为传说中站务扎的后裔'; //怪物描述
        monsterItem.MonsterHP = 20;//怪物血量
        monsterItem.MonsterAttach = 10;//怪物攻击
        monsterItem.MonsterDefense = 4;//怪物防御
        this.MonsterRepo.put(1, monsterItem);
        this.MonsterSize = 1;

        monsterItem = new  MonsterItem();
        this.MonsterSize += 1;
        monsterItem.MonsterId = this.MonsterSize;
        monsterItem.MonsterName = '野猪'; //怪物名称
        monsterItem.MonsterDesc = '据说为传说中站务扎的后裔'; //怪物描述
        monsterItem.MonsterHP = 30;//怪物血量
        monsterItem.MonsterAttach = 12;//怪物攻击
        monsterItem.MonsterDefense = 6;//怪物防御
        this.MonsterRepo.put(this.MonsterSize, monsterItem);



        //插入新手村掉落装备
        this.EquipmentSize = 1;
        var equipmentItem = new  EquipmentItem();
        equipmentItem.ItemID = this.EquipmentSize;
        equipmentItem.type = 1;// 1 武器 2衣服 3盾牌
        equipmentItem.ItemName = "祖传倚天剑";
        equipmentItem.ItemRequireLevel = 0;
        equipmentItem.ItemLevel = 1;
        equipmentItem.Attach = 2;
        equipmentItem.Defense = 0;
        equipmentItem.HP = 0;
        equipmentItem.EquipmentDesc = "倚天点击就送"; //装备描述
        equipmentItem.Overlay = 0; //是否可叠加
        equipmentItem.IsConsumables = 0; //是否为可消耗品
        this.EquipmentRepo.put(this.EquipmentSize, equipmentItem);

        this.EquipmentSize += 1;
        equipmentItem = new  EquipmentItem();
        equipmentItem.ItemID = this.EquipmentSize;
        equipmentItem.type = 2;// 1 武器 2衣服 3盾牌
        equipmentItem.ItemName = "布衣";
        equipmentItem.ItemRequireLevel = 0;
        equipmentItem.ItemLevel = 1;
        equipmentItem.Attach = 0;
        equipmentItem.Defense = 2;
        equipmentItem.HP = 10;
        equipmentItem.EquipmentDesc = "新手布衣"; //装备描述
        equipmentItem.Overlay = 0; //是否可叠加
        equipmentItem.IsConsumables = 0; //是否为可消耗品
        this.EquipmentRepo.put(this.EquipmentSize, equipmentItem);


        this.EquipmentSize += 1;
        equipmentItem = new  EquipmentItem();
        equipmentItem.ItemID = this.EquipmentSize;
        equipmentItem.type = 3;// 1 武器 2衣服 3盾牌
        equipmentItem.ItemName = "木盾";
        equipmentItem.ItemRequireLevel = 0;
        equipmentItem.ItemLevel = 1;
        equipmentItem.Attach = 0;
        equipmentItem.Defense = 3;
        equipmentItem.HP = 0;
        equipmentItem.EquipmentDesc = "新手木盾"; //装备描述
        equipmentItem.Overlay = 0; //是否可叠加
        equipmentItem.IsConsumables = 0; //是否为可消耗品
        this.EquipmentRepo.put(this.EquipmentSize, equipmentItem);


        //插入新手地图
        this.MapSize = 1;
        var mapItem = new MapItem();
        mapItem.MapID = this.MapSize;
        mapItem.MapName = '新手村';
        mapItem.MapRequireLevel = 0;//地图进入等级
        mapItem.MapHighestLevel = 5;//地图最高等级
        mapItem.NormalMonsterId = [1];//小怪ID
        mapItem.BossMonsterId = [2];// BOSS ID
        mapItem.rewardExp = 10; //地图奖励经验
        mapItem.rewardMoney = 1; //地图奖励金钱
        mapItem.rewradRate = 25;//0-100
        mapItem.BossRewardItemIds = [1, 2]; //Boss可能掉落物品
        mapItem.BattleEndRecover = 10; //战斗结束恢复生命值
        this.MapRepo.put(this.MapSize, mapItem);

        this.BattleMaxRound = 30;
        this.LevelExps = { 1: 100, 2: 200, 3: 400, 4: 800, 5: 1600 };
        this.BossBattleRate = 10;
        this.IntensifyCostMoneys = { 1: 100, 2: 200, 3: 1000 };
        this.IntensifyCostLevelBase = { 1: 5, 2: 6, 3: 8 };//额外金钱需求为 0->1  base + itemLevel*5

        this.UserAttachIncrease = 2;
        this.UserDefenseIncrease = 2;
        this.UserHPIncrease = 100;
    },
    SuperUserModifyConfig:function(type,data){
        var calladdress = Blockchain.transaction.from;
        var superuser = this.superaddressRepo.get(calladdress);
        if (!superuser) {
            throw new Error("call address is " + calladdress + " is not super user! this function only allow superuser call!");
        }
        //type 1 LevelExps 2 IntensifyCostMoneys 3 IntensifyCostLevelBase 4 BossBattleRate
        if(type == 1){
            var new_data = data.replace(/'/g,'"');
            var inputs = JSON.parse(new_data);
            this.LevelExps = inputs;
        }
        else if(type == 2){
            var new_data = data.replace(/'/g,'"');
            var inputs = JSON.parse(new_data);
            this.IntensifyCostMoneys = inputs;
        }
        else if(type == 3){
            var new_data = data.replace(/'/g,'"');
            var inputs = JSON.parse(new_data);
            this.IntensifyCostLevelBase = inputs;
        }
        else if(type ==4)
        {
            this.BossBattleRate=data;
        }
    },
    SuperUserAddData: function (type, data) {
        var calladdress = Blockchain.transaction.from;
        var superuser = this.superaddressRepo.get(calladdress);
        if (!superuser) {
            throw new Error("call address is " + calladdress + " is not super user! this function only allow superuser call!");
        }
        var new_data = data.replace(/'/g,'"');
        var inputs = JSON.parse(new_data);
        //type 1 装备信息  2 地图信息  3 怪物数据
        if (type == 1) {
            //id == -1 表示新增
            if (inputs.ItemID == -1) {
                this.EquipmentSize += 1;
                var itemID = this.EquipmentSize;
                console.log("ItemID" + itemID);
                var equipmentItem =new EquipmentItem(new_data);
                equipmentItem.ItemID = itemID;
                this.EquipmentRepo.put(itemID, equipmentItem);

            }
            else {
                var equipmentItem = this.EquipmentRepo.get(inputs.ItemID);
                if (!equipmentItem) {
                    throw new Error("ItemID: " + inputs.ItemID + " not Existed!")
                }
                equipmentItem =new EquipmentItem(new_data);
                equipmentItem.ItemID = inputs.ItemID;
                this.EquipmentRepo.put(inputs.ItemID, equipmentItem);
            }
        }
        //2 地图信息
        else if (type == 2) {
            if (inputs.MapID == -1) {
                this.MapSize += 1;
                var mapID = this.MapSize;
                console.log("mapID" + mapID);
                var mapItem =new MapItem(new_data);
                mapItem.MapID = mapID;
                this.MapRepo.put(mapID, mapItem);

            }
            else {
                var mapItem = this.MapRepo.get(inputs.MapID);
                if (!mapItem) {
                    throw new Error("mapID: " + inputs.MapID + " not Existed!")
                }
                mapItem =new MapItem(new_data);
                mapItem.MapID = inputs.MapID;
                this.MapRepo.put(inputs.MapID, mapItem);
            }
        }
        // 3 怪物数据
        else if (type == 3) {
            if (inputs.MonsterID == -1) {
                this.MonsterSize += 1;
                var monsterID = this.MonsterSize;
                console.log("monsterID" + monsterID);
                var monsterItem =new MonsterItem(new_data);
                monsterItem.MonsterID = monsterID;
                this.MonsterRepo.put(monsterID, monsterItem);

            }
            else {
                var monsterItem = this.MonsterRepo.get(inputs.MonsterID);
                if (!monsterItem) {
                    throw new Error("MonsterId: " + inputs.MonsterID + " not Existed!")
                }
                monsterItem =new MonsterItem(new_data);
                monsterItem.MonsterID = inputs.MonsterID;
                this.MonsterRepo.put(inputs.MonsterID, monsterItem);
            }
        }

    },
    RegisterUser: function (userName, sex, content) {
        var userAddress = Blockchain.transaction.from;
        var userItem = this.addressRepo.get(userAddress);
        if (userItem) {
            throw new Error("Useraddress: " + userAddress + " already registered!")
        }
        var userItem = new UserItem();
        userItem.OwnerAddress = userAddress;
        userItem.UserName = userName;
        userItem.Sex = sex;
        userItem.Content = content;
        userItem.Time = Blockchain.transaction.timestamp;
        this.addressRepo.put(userAddress, userItem);
        var firstBattleRecord =new BattleRecordItem();
        firstBattleRecord.OwnerAddress = userAddress;
        firstBattleRecord.MapId = 1;
        firstBattleRecord.RecordStartBlockNumber = Blockchain.block.height;
        this.BattleRecordRepo.put(userAddress, firstBattleRecord);
    },
    QueryBattleReward: function () {
        var userAddress = Blockchain.transaction.from;
        var battleRecordItem = this.BattleRecordRepo.get(userAddress);
        if (!battleRecordItem) {
            throw new Error("Useraddress: " + userAddress + " not registered!")
        }
        var currentBlockHeight = Blockchain.block.height;
        var MapItem = this.MapRepo.get(battleRecordItem.MapId);
        var rewardexp = (currentBlockHeight - battleRecordItem.RecordStartBlockNumber) * MapItem.rewardExp;
        var rewardMoney = (currentBlockHeight - battleRecordItem.RecordStartBlockNumber) * MapItem.rewardMoney;
        return { "rewardexp": rewardexp, "rewardMoney": rewardMoney };

    },

    _ExecBattleMonster(useraddress, monsterId) {
        //0 战斗失败  1 战斗胜利  2 战平 返回战斗结果
        var monsterItem = this.MonsterRepo.get(monsterId);
        var userItem = this.addressRepo.get(useraddress);
        for (var i = 0; i < this.BattleMaxRound; i++) {
            userItem.HP -= Math.max(monsterItem.MonsterAttach - userItem.Defense,0);
            monsterItem.MonsterHP -= Math.max(userItem.Attach - monsterItem.MonsterDefense,0);
            Event.Trigger("battle_test", monsterItem);
            if (userItem.HP <= 0) {
                return 0;
            }
            if (monsterItem.MonsterHP <= 0) {
                return 1;
            }
        }
        return 2;
    }
    ,
    _rewardItem(useraddress, itemId) {
        //获得物品
        var packageItems = this.PackageRepo.get(useraddress) || [];
        var equipmentItem = this.EquipmentRepo.get(itemId);
        var isfind = 0;
        if (equipmentItem.IsConsumables == 1) {
            //可叠加则查找是否已存在物品

            for (var i = 0; i < packageItems.length; i++) {
                if (packageItems[i].EquipmentItemId == itemId) {
                    packageItems[i].ItemCount += 1;
                    isfind = 1;
                    break;
                }
            }
        }
        if (isfind == 0) {
            var pack =new PackageItem();
            pack.OwnerAddress = useraddress;//拥有者地址
            pack.EquipmentItemId = itemId; //道具Id
            pack.EquipmentIntensifyLevel = 0;
            pack.ItemCount = 1;
            packageItems.push(pack);
        }
        this.PackageRepo.put(useraddress, packageItems);
        return equipmentItem;
    },
    _rewardExp(useraddress, mapItem) {
        var userItem = this.addressRepo.get(useraddress);
        if (userItem.Level > mapItem.MapHighestLevel) {
            return;
        }
        userItem.CurrentExp += mapItem.rewardExp;
        userItem.CurrentMoney += mapItem.rewardMoney;
        var levelneedexp = this.LevelExps[userItem.Level];
        if (levelneedexp) {
            if (levelneedexp <= userItem.CurrentExp) {
                userItem.CurrentExp -= levelneedexp;
                userItem.MaxHP += this.UserHPIncrease;
                userItem.HP += this.UserHPIncrease;
                userItem.Attach += this.UserAttachIncrease;
                userItem.Defense += this.UserDefenseIncrease;
                userItem.Level += 1;
            }
        }
        this.addressRepo.put(useraddress, userItem);
    },
    _ExecOneBattle(useraddress, blocknum, mapID) {
        //进行一个块高度结算
        var mapItem = this.MapRepo.get(mapID);
        var myseed = "" + useraddress + mapID + blocknum;
        console.log("random seed: " + myseed);
        Math.random.seed(myseed);
        var monsterRate = parseInt(Math.random() * 100);
        var result = new Map();
        if (monsterRate < this.BossBattleRate) {
            //遇到BOSS
            var rand = parseInt(Math.random() * mapItem.BossMonsterId.length);
            var monsterId = mapItem.BossMonsterId[rand];
            var battleResult = this._ExecBattleMonster(useraddress, monsterId);
            result["monster"] = this.MonsterRepo.get(monsterId);
            result["battleResult"] = battleResult;
            if (battleResult == 1) {
                var rewardRate = parseInt(Math.random() * 100);
                if (rewardRate < mapItem.rewardRate) {
                    var itemrand = parseInt(Math.random() * mapItem.BossRewardItemIds.length);
                    var itemId = mapItem.BossRewardItemIds[itemrand];
                    var reward = this._rewardItem(useraddress, itemId);
                    result["reward"] = reward;
                }

                this._rewardExp(useraddress, mapItem);
            }

        }
        else {
            //遇到小怪
            var rand = parseInt(Math.random() * mapItem.NormalMonsterId.length);
            var monsterId = mapItem.NormalMonsterId[rand];
            var battleResult = this._ExecBattleMonster(useraddress, monsterId);
            result["monster"] = this.MonsterRepo.get(monsterId);
            result["battleResult"] = battleResult;
            if (battleResult == 1) {
                this._rewardExp(useraddress, mapItem);
            }
        }
        return result;
        //Math.random()
    },
    CalBattleResult: function (newMapID) {
        var userAddress = Blockchain.transaction.from;
        var battleRecordItem = this.BattleRecordRepo.get(userAddress);
        if (!battleRecordItem) {
            throw new Error("Useraddress: " + userAddress + " not registered!")
        }
        var BattleResults = [];
        var currentBlockHeight = Blockchain.block.height;
        for (var i = battleRecordItem.RecordStartBlockNumber; i < currentBlockHeight; i++) {
            var oneResult = this._ExecOneBattle(userAddress, i, battleRecordItem.MapId);
            BattleResults.push(oneResult);
        }
        battleRecordItem.MapId=newMapID;
        battleRecordItem.RecordStartBlockNumber = Blockchain.block.height;
        this.BattleRecordRepo.put(userAddress,battleRecordItem);
        return BattleResults;
    },

    QueryBattleResult: function (blockheight) {
        var userAddress = Blockchain.transaction.from;
        var battleRecordItem = this.BattleRecordRepo.get(userAddress);
        if (!battleRecordItem) {
            throw new Error("Useraddress: " + userAddress + " not registered!")
        }

        if(blockheight <battleRecordItem.RecordStartBlockNumber)
        {
            blockheight = battleRecordItem.RecordStartBlockNumber;
        }
        var BattleResults = [];
        var currentBlockHeight = Blockchain.block.height;
        for (var i = blockheight; i < currentBlockHeight; i++) {
            var oneResult = this._ExecOneBattle(userAddress, i, battleRecordItem.MapId);
            BattleResults.push(oneResult);
        }
        return {"result":BattleResults,"blockheight":currentBlockHeight,"maxBattleRound":this.BattleMaxRound};
    },
    useItem: function (packageIndex) {
        var userAddress = Blockchain.transaction.from;
        var userItem = this.addressRepo.get(userAddress);
        if (!userItem) {
            throw new Error("Useraddress: " + userAddress + " not registered!")
        }
        var packageItems = this.PackageRepo.get(useraddress) || [];
        if (packageIndex >= packageItems.length) {
            throw new Error("Useraddress: " + userAddress + " not have the item: " + packageIndex + "!");
        }
        var packItem = packageItems[packageIndex];
        var oldequipId = -1;
        if (packItem.type == 1) {
            //武器
            oldequipId = userItem.WeaponId;
        }
        else if (packItem.type == 2) {
            //衣服
            oldequipId = userItem.ArmorId;
        }
        else if (packItem.type == 3) {
            //盾牌
            oldequipId = userItem.ShieldId;
        }
        else if (packItem.type == 4) {
            //可使用物品灵丹妙药
            oldequipId = -1;
            if (packItem.ItemCount == 0) {
                throw new Error("Item is already used!");
            }
        }
        var equipItem = this.EquipmentRepo.get(packItem.EquipmentItemId);
        if (userItem.Level >= equipItem.ItemRequireLevel) {
            if (oldequipId !== -1) {
                //穿戴过装备
                var oldpack = packageItems[oldequipId];
                var oldequipItem = this.EquipmentRepo.get(oldpack.EquipmentItemId);
                userItem.Attach -= oldequipItem.Attach;
                userItem.Defense -= oldequipItem.Defense;
                userItem.HP -= oldequipItem.HP;
                userItem.MaxHP -= oldequipItem.HP;
            }
            userItem.Attach += equipItem.Attach;
            userItem.Defense += equipItem.Defense;
            userItem.HP += equipItem.HP;
            userItem.MaxHP += equipItem.HP;


        }
        else {
            throw new Error("Userlevel: " + userItem.Level + " is less than: requireLevel: " + equipItem.ItemRequireLevel + "!");
        }
        if (packItem.type == 1) {
            //武器
            userItem.WeaponId = packageIndex;
        }
        else if (packItem.type == 2) {
            //衣服
            userItem.ArmorId = packageIndex;
        }
        else if (packItem.type == 3) {
            //盾牌
            userItem.ShieldId = packageIndex;
        }
        else if (packItem.type == 4) {
            packageItems[packageIndex].ItemCount -= 1;
            this.PackageRepo.put(userAddress, packageItems);
        }
        this.addressRepo.put(userAddress, useItem);

    },
    QueryUserPackage: function () {
        var userAddress = Blockchain.transaction.from;
        var userItem = this.addressRepo.get(userAddress);
        if (!userItem) {
            throw new Error("Useraddress: " + userAddress + " not registered!")
        }
        var packageItems = this.PackageRepo.get(userAddress) || [];
        for (var i = 0; i < packageItems.length; i++) {
            packageItems[i].itemDetail = this.EquipmentRepo.get(packageItems[i].EquipmentItemId);
        }
        return packageItems;
    },
    QueryUserData: function () {
        var userAddress = Blockchain.transaction.from;
        var userItem = this.addressRepo.get(userAddress);
        if (!userItem) {
            throw new Error("Useraddress: " + userAddress + " not registered!")
        }
        return userItem;
    },
    QueryMaps: function (mapIndex) {
        var result = [];
        if (mapIndex == -1) {
            for (var i = 1; i <= this.MapSize; i++) {
                result.push(this.MapRepo.get(i));
            }

        }
        else {
            var oneMap = this.MapRepo.get(mapIndex);
            if (!oneMap) {
                throw new Error("MapID: " + mapIndex + " not exist!")
            }
            result.push(oneMap);
        }

        return result;
    },
    QueryMonsters: function (monsterIndex) {
        var result = [];
        if (monsterIndex == -1) {
            for (var i = 1; i <= this.MonsterSize; i++) {
                result.push(this.MonsterRepo.get(i));
            }

        }
        else {
            var oneMonster = this.MonsterRepo.get(monsterIndex);
            if (!oneMonster) {
                throw new Error("monsterIndex: " + monsterIndex + " not exist!")
            }
            result.push(oneMonster);
        }

        return result;
    },
    QueryEquipments: function (Index) {
        var result = [];
        if (Index == -1) {
            for (var i = 1; i <= this.EquipmentSize; i++) {
                result.push(this.EquipmentRepo.get(i));
            }

        }
        else {
            var oneEquip = this.EquipmentRepo.get(Index);
            if (!oneEquip) {
                throw new Error("EquipmenIndex: " + Index + " not exist!")
            }
            result.push(oneEquip);
        }

        return result;
    }
};
module.exports = CultivateImmortalityService;
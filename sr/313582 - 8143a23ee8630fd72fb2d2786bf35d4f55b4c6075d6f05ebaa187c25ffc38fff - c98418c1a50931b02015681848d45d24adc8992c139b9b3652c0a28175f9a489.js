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
        this.SellPrice = obj.SellPrice; //售卖价格

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
        this.SellPrice = 0;
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
        this.rewardRate = obj.rewardRate;//0-100
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
        this.rewardRate = 0;//0-100
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
    LocalContractStorage.defineProperty(this, "MaxBattleCount");


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
            var items = JSON.parse(text);
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

        this.InsertMonster("小蝙蝠","森林的原住民",60,14,8);//3
        this.InsertMonster("蝙蝠","森林的原住民",100,16,7);//4
        this.InsertMonster("小狐狸","非常狡诈但身板很弱",120,20,2);//5
        this.InsertMonster("老虎","森林中的霸主",480,22,10);//6
        this.InsertMonster("蒙面人","土匪窝中的积年恶匪",600,25,12);//7
        this.InsertMonster("山贼","土匪窝中的积年恶匪",650,26,13);//8
        this.InsertMonster("土匪","土匪窝中的积年恶匪",550,27,11);//9
        this.InsertMonster("流氓","土匪窝中的积年恶匪",580,24,14);//10
        this.InsertMonster("山大王","土匪窝中的战斗机",900,40,20);//11
        this.InsertMonster("圣兽护院","传说中看家护院的杂兵",1500,60,25);//12
        this.InsertMonster("幼青龙","传说中四圣兽的崽",2000,80,40);//13
        this.InsertMonster("幼朱雀","传说中四圣兽的崽",2000,80,40);//14
        this.InsertMonster("幼玄武","传说中四圣兽的崽",2000,80,40);//15
        this.InsertMonster("幼白虎","传说中四圣兽的崽",2000,80,40);//16

        //插入新手村掉落装备
        this.EquipmentSize = 1;
        var equipmentItem = new  EquipmentItem();
        equipmentItem.ItemID = this.EquipmentSize;
        equipmentItem.type = 1;// 1 武器 2衣服 3盾牌
        equipmentItem.ItemName = "祖传倚天剑";
        equipmentItem.ItemRequireLevel = 0;
        equipmentItem.ItemLevel = 1;
        equipmentItem.Attach = 6;
        equipmentItem.Defense = 0;
        equipmentItem.HP = 0;
        equipmentItem.EquipmentDesc = "倚天点击就送"; //装备描述
        equipmentItem.Overlay = 0; //是否可叠加
        equipmentItem.IsConsumables = 0; //是否为可消耗品
        equipmentItem.SellPrice = 1;
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
        equipmentItem.SellPrice = 1;
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
        equipmentItem.SellPrice = 1;
        this.EquipmentRepo.put(this.EquipmentSize, equipmentItem);
        this.InsertEquip(1,"大侠剑","行走江湖的标配",4,5,10,12,0,0,0,5);//4
        this.InsertEquip(2,"大侠衫","行走江湖的标配",4,5,30,1,4,0,0,5);//5
        this.InsertEquip(3,"大侠盾","行走江湖的标配",4,5,50,1,5,0,0,5);//6

        this.InsertEquip(1,"怨念剑","原谅三件套",7,10,100,20,1,0,0,10);//7
        this.InsertEquip(2,"怨念帽","原谅三件套",7,10,300,3,7,0,0,10);//8
        this.InsertEquip(3,"怨念盾","原谅三件套",7,10,200,3,6,0,0,10);//9

        this.InsertEquip(1,"管家剑","管家扫地三件套",9,10,100,45,2,0,0,15);//10
        this.InsertEquip(2,"管家帽","管家扫地三件套",9,10,300,13,8,0,0,15);//11
        this.InsertEquip(3,"管家盾","管家扫地三件套",9,10,200,13,8,0,0,15);//12

        this.InsertEquip(1,"恶魔之力","作者的馈赠",10,20,500,70,10,0,0,100);//13

        this.InsertEquip(1,"伪圣兽刀","使用圣兽材料夺天地造化而成的刀",13,30,100,100,15,0,0,150);//14
        this.InsertEquip(2,"伪圣兽衫","使用圣兽材料夺天地造化而成的衫",13,30,300,20,25,0,0,150);//15
        this.InsertEquip(3,"伪圣兽盾","使用圣兽材料夺天地造化而成的盾",13,30,200,20,30,0,0,150);//16



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
        mapItem.rewardRate = 25;//0-100
        mapItem.BossRewardItemIds = [1, 2]; //Boss可能掉落物品
        mapItem.BattleEndRecover = 10; //战斗结束恢复生命值
        this.MapRepo.put(this.MapSize, mapItem);


        this.InsertMap("小树林",2,8,[2,3],[4],12,2,25,[3],10);
        this.InsertMap("荒山",3,9,[3,4,5],[6],15,4,25,[4,5],10);
        this.InsertMap("丛林深处",5,11,[3,4,5],[6,7],30,5,25,[6],10);
        this.InsertMap("土匪窝",6,13,[8,9,10],[11],60,7,15,[7,8,9],10);
        this.InsertMap("圣兽谷",8,15,[11],[12],120,10,10,[10,11,12],10);
        this.InsertMap("神秘之地",8,16,[11,12],[17],240,15,10,[13],10);
        this.InsertMap("圣兽洞",8,16,[12],[13,14,15,16],480,30,5,[14,15,16],10);


        this.BattleMaxRound = 30;
        this.LevelExps = { 1: 100, 2: 200, 3: 400, 4: 800, 5: 1600 ,6:4000,7:8000,8:20000,9:40000,10:80000,11:160000,12:320000,13:740000,14:1500000,15:3000000,16:6000000,17:12000000};
        this.BossBattleRate = 10;
        this.IntensifyCostMoneys = { 1: 100, 2: 200, 3: 1000 };
        this.IntensifyCostLevelBase = { 1: 5, 2: 6, 3: 8 };//额外金钱需求为 0->1  base + itemLevel*5

        this.UserAttachIncrease = 2;
        this.UserDefenseIncrease = 2;
        this.UserHPIncrease = 100;
        this.MaxBattleCount = 100;
    },
    QueryConfig:function(type){
        if(type == 1){
            return this.LevelExps;
        }
        else if(type == 2){
            return this.IntensifyCostMoneys;
        }
        else if(type == 3){
            
            return this.IntensifyCostLevelBase ;
        }
        else if(type ==4)
        {
            return this.BossBattleRate;
        }
        else if(type ==5){
            return this.MaxBattleCount ;
        }
    },
    SuperUserModifyConfig:function(type,data){
        var calladdress = Blockchain.transaction.from;
        var superuser = this.superaddressRepo.get(calladdress);
        if (!superuser) {
            throw new Error("call address is " + calladdress + " is not super user! this function only allow superuser call!");
        }
        //type 1 LevelExps 2 IntensifyCostMoneys 3 IntensifyCostLevelBase 4 BossBattleRate 5 最大挂机战斗次数
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
        else if(type ==5){
            this.MaxBattleCount = data;
        }
    },
    InsertMonster:function(Name,Desc,HP,attach,defense){
        var monsterItem = new  MonsterItem();
        this.MonsterSize += 1;
        monsterItem.MonsterId = this.MonsterSize;
        monsterItem.MonsterName = Name; //怪物名称
        monsterItem.MonsterDesc = Desc; //怪物描述
        monsterItem.MonsterHP = HP;//怪物血量
        monsterItem.MonsterAttach = attach;//怪物攻击
        monsterItem.MonsterDefense = defense;//怪物防御
        this.MonsterRepo.put(this.MonsterSize, monsterItem);
    }
    ,
    InsertEquip:function(Type,Name,Desc,RequireLevel,ItemLevel,HP,attach,defense,Overlay,IsConsumables,SellPrice){
        this.EquipmentSize += 1;
        var equipmentItem = new  EquipmentItem();
        equipmentItem.ItemID = this.EquipmentSize;
        equipmentItem.type = Type;// 1 武器 2衣服 3盾牌
        equipmentItem.ItemName = Name;
        equipmentItem.ItemRequireLevel = RequireLevel;
        equipmentItem.ItemLevel = ItemLevel;
        equipmentItem.Attach = attach;
        equipmentItem.Defense = defense;
        equipmentItem.HP = HP;
        equipmentItem.EquipmentDesc = Desc; //装备描述
        equipmentItem.Overlay = Overlay; //是否可叠加
        equipmentItem.IsConsumables = IsConsumables; //是否为可消耗品
        equipmentItem.SellPrice = SellPrice;
        this.EquipmentRepo.put(this.EquipmentSize, equipmentItem);
    },
    InsertMap:function(Name,MapRequireLevel,MapHighestLevel,NormalMonsterId,BossMonsterId,rewardExp,rewardMoney,rewardRate,BossRewardItemIds,BattleEndRecover){
        this.MapSize += 1;
        var mapItem = new MapItem();
        mapItem.MapID = this.MapSize;
        mapItem.MapName = Name;
        mapItem.MapRequireLevel = MapRequireLevel;//地图进入等级
        mapItem.MapHighestLevel = MapHighestLevel;//地图最高等级
        mapItem.NormalMonsterId = NormalMonsterId;//小怪ID
        mapItem.BossMonsterId = BossMonsterId;// BOSS ID
        mapItem.rewardExp = rewardExp; //地图奖励经验
        mapItem.rewardMoney = rewardMoney; //地图奖励金钱
        mapItem.rewardRate = rewardRate;//0-100
        mapItem.BossRewardItemIds = BossRewardItemIds; //Boss可能掉落物品
        mapItem.BattleEndRecover = BattleEndRecover; //战斗结束恢复生命值
        this.MapRepo.put(this.MapSize, mapItem);
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
        return { "rewardexp": rewardexp, "rewardMoney": rewardMoney ,"currentMap":MapItem.MapName,"currentMapId":battleRecordItem.MapId};

    },

    _ExecBattleMonster(userAddress, monsterId) {
        //0 战斗失败  1 战斗胜利  2 战平 返回战斗结果
        var monsterItem = this.MonsterRepo.get(monsterId);
        var userItem = this.addressRepo.get(userAddress);
        for (var i = 0; i < this.BattleMaxRound; i++) {
            userItem.HP -= Math.max(monsterItem.MonsterAttach - userItem.Defense,0);
            monsterItem.MonsterHP -= Math.max(userItem.Attach - monsterItem.MonsterDefense,0);
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
    _rewardItem(userAddress, itemId) {
        //获得物品
        var packageItems = this.PackageRepo.get(userAddress) || [];
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
            pack.OwnerAddress = userAddress;//拥有者地址
            pack.EquipmentItemId = itemId; //道具Id
            pack.EquipmentIntensifyLevel = 0;
            pack.ItemCount = 1;
            packageItems.push(pack);
        }
        this.PackageRepo.put(userAddress, packageItems);
        return equipmentItem;
    },
    _rewardExp(userAddress, mapItem) {
        var userItem = this.addressRepo.get(userAddress);
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
        this.addressRepo.put(userAddress, userItem);
    },
    _ExecOneBattle(userAddress, blocknum, mapID) {
        //进行一个块高度结算
        var mapItem = this.MapRepo.get(mapID);
        var myseed = "" + userAddress + mapID + blocknum;
        console.log("random seed: " + myseed);
        Math.random.seed(myseed);
        var monsterRate = parseInt(Math.random() * 100);
        if (monsterRate < this.BossBattleRate) {
            //遇到BOSS
            var rand = parseInt(Math.random() * mapItem.BossMonsterId.length);
            var monsterId = mapItem.BossMonsterId[rand];
            var battleResult = this._ExecBattleMonster(userAddress, monsterId);
            if (battleResult == 1) {
                var rewardRate = parseInt(Math.random() * 100);
                if (rewardRate < mapItem.rewardRate) {
                    var itemrand = parseInt(Math.random() * mapItem.BossRewardItemIds.length);
                    var itemId = mapItem.BossRewardItemIds[itemrand];
                    var reward = this._rewardItem(userAddress, itemId);
                }

                this._rewardExp(userAddress, mapItem);
            }

        }
        else {
            //遇到小怪
            var rand = parseInt(Math.random() * mapItem.NormalMonsterId.length);
            var monsterId = mapItem.NormalMonsterId[rand];
            var battleResult = this._ExecBattleMonster(userAddress, monsterId);
            if (battleResult == 1) {
                this._rewardExp(userAddress, mapItem);
            }
        }
        return "success";
        //Math.random()
    },
    _ExecOneBattle_log(userAddress, blocknum, mapID) {
        //进行一个块高度结算
        var mapItem = this.MapRepo.get(mapID);
        var myseed = "" + userAddress + mapID + blocknum;
        console.log("random seed: " + myseed);
        Math.random.seed(myseed);
        var monsterRate = parseInt(Math.random() * 100);
        var result = new Map();
        if (monsterRate < this.BossBattleRate) {
            //遇到BOSS
            var rand = parseInt(Math.random() * mapItem.BossMonsterId.length);
            var monsterId = mapItem.BossMonsterId[rand];
            var battleResult = this._ExecBattleMonster(userAddress, monsterId);
            result["monster"] = this.MonsterRepo.get(monsterId);
            result["battleResult"] = battleResult;
            if (battleResult == 1) {
                var rewardRate = parseInt(Math.random() * 100);
                if (rewardRate < mapItem.rewardRate) {
                    var itemrand = parseInt(Math.random() * mapItem.BossRewardItemIds.length);
                    var itemId = mapItem.BossRewardItemIds[itemrand];
                    var reward = this._rewardItem(userAddress, itemId);
                    result["reward"] = reward;
                }

                this._rewardExp(userAddress, mapItem);
            }

        }
        else {
            //遇到小怪
            var rand = parseInt(Math.random() * mapItem.NormalMonsterId.length);
            var monsterId = mapItem.NormalMonsterId[rand];
            var battleResult = this._ExecBattleMonster(userAddress, monsterId);
            result["monster"] = this.MonsterRepo.get(monsterId);
            result["battleResult"] = battleResult;
            if (battleResult == 1) {
                this._rewardExp(userAddress, mapItem);
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
        var mapItem = this.MapRepo.get(newMapID);
        if (!mapItem) {
            throw new Error("MapID: " + newMapID + " not exist!")
        }
        var currentBlockHeight = Blockchain.block.height;
        for (var i = battleRecordItem.RecordStartBlockNumber; i < min(currentBlockHeight,battleRecordItem.RecordStartBlockNumber+this.MaxBattleCount); i++) {
            this._ExecOneBattle(userAddress, i, battleRecordItem.MapId);
        }
        battleRecordItem.MapId=newMapID;
        battleRecordItem.RecordStartBlockNumber = currentBlockHeight;
        this.BattleRecordRepo.put(userAddress,battleRecordItem);
        return ;
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
        for (var i = blockheight; i < battleRecordItem.RecordStartBlockNumber +this.MaxBattleCount; i++) {
            var oneResult = this._ExecOneBattle_log(userAddress, i, battleRecordItem.MapId);
            BattleResults.push(oneResult);
        }
        var MapItem = this.MapRepo.get(battleRecordItem.MapId);
        return {"result":BattleResults,"blockheight":currentBlockHeight,"BattleMapName":MapItem.MapName,"startBlockHeight":battleRecordItem.RecordStartBlockNumber};
    },
    unloadItem:function(packageIndex){
        var userAddress = Blockchain.transaction.from;
        var userItem = this.addressRepo.get(userAddress);
        if (!userItem) {
            throw new Error("Useraddress: " + userAddress + " not registered!")
        }
        var packageItems = this.PackageRepo.get(userAddress) || [];
        if (packageIndex >= packageItems.length || packageIndex<0) {
            throw new Error("Useraddress: " + userAddress + " not have the item: " + packageIndex + "!");
        }
        if (userItem.WeaponId!=packageIndex && userItem.ArmorId!=packageIndex &&userItem.ShieldId!=packageIndex){
            throw new Error("Item didn't equip: " + packageIndex  + "!");
        }
        var oldpack = packageItems[packageIndex];
        var oldequipItem = this.EquipmentRepo.get(oldpack.EquipmentItemId);
        userItem.Attach -= oldequipItem.Attach;
        userItem.Defense -= oldequipItem.Defense;
        userItem.HP -= oldequipItem.HP;
        userItem.MaxHP -= oldequipItem.HP;
        if (userItem.WeaponId==packageIndex ) {
            userItem.WeaponId =-1;
        }
        else if(userItem.ArmorId==packageIndex){
            userItem.ArmorId = -1;
        }else if(userItem.ShieldId==packageIndex){
            userItem.ShieldId = -1;
        }
        this.addressRepo.put(userAddress, userItem);
    },
    useItem: function (packageIndex) {
        var userAddress = Blockchain.transaction.from;
        var userItem = this.addressRepo.get(userAddress);
        if (!userItem) {
            throw new Error("Useraddress: " + userAddress + " not registered!")
        }
        var packageItems = this.PackageRepo.get(userAddress) || [];
        if (packageIndex >= packageItems.length || packageIndex<0) {
            throw new Error("Useraddress: " + userAddress + " not have the item: " + packageIndex + "! package count"+packageItems.length);
        }
        var packItem = packageItems[packageIndex];
        var equipItem = this.EquipmentRepo.get(packItem.EquipmentItemId);
        var oldequipId = -1;
        if (equipItem.type == 1) {
            //武器
            oldequipId = userItem.WeaponId;
        }
        else if (equipItem.type == 2) {
            //衣服
            oldequipId = userItem.ArmorId;
        }
        else if (equipItem.type == 3) {
            //盾牌
            oldequipId = userItem.ShieldId;
        }
        else if (equipItem.type == 4) {
            //可使用物品灵丹妙药
            oldequipId = -1;
            if (packItem.ItemCount == 0) {
                throw new Error("Item is already used!");
            }
        }
        
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
        if (equipItem.type == 1) {
            //武器
            userItem.WeaponId = packageIndex;
        }
        else if (equipItem.type == 2) {
            //衣服
            userItem.ArmorId = packageIndex;
        }
        else if (equipItem.type == 3) {
            //盾牌
            userItem.ShieldId = packageIndex;
        }
        else if (equipItem.type == 4) {
            packageItems[packageIndex].ItemCount -= 1;
            this.PackageRepo.put(userAddress, packageItems);
        }
        this.addressRepo.put(userAddress, userItem);

    },
    sellItems(itemIds){
        var userAddress = Blockchain.transaction.from;
        var userItem = this.addressRepo.get(userAddress);
        if (!userItem) {
            throw new Error("Useraddress: " + userAddress + " not registered!")
        }
        var packageItems = this.PackageRepo.get(userAddress) || [];
        if (packageItems.length < itemIds.length) {
            throw new Error("Useraddress: " + userAddress + " not have so much items: !");
        }
        var Weaponcount=0;
        var Armorcount=0;
        var Shieldcount=0;
        for(var i =0;i<itemIds.length;i++){
            
            if(itemIds[i]<0 || itemIds[i]>=packageItems.length|| itemIds[i] ==userItem.WeaponId ||itemIds[i] ==userItem.ArmorId ||itemIds[i] ==userItem.ShieldId){
                throw new Error("some item have alreay equiped: " + itemIds[i] + "  !");
            }
            if(itemIds[i] < userItem.WeaponId){
                Weaponcount +=1;
            }
            if(itemIds[i]<userItem.ArmorId){
                Armorcount+=1;
            }
            if(itemIds[i]<userItem.ShieldId){
                Shieldcount+=1;
            }
            var one_item = packageItems[itemIds[i]];
            var equipItem = this.EquipmentRepo.get(one_item.EquipmentItemId);
            userItem.CurrentMoney +=equipItem.SellPrice;
            
        }
        for(var i =0;i<itemIds.length;i++){
            packageItems.splice(itemIds[i]-i,1);
        }
        userItem.WeaponId -= Weaponcount;
        userItem.ArmorId -= Armorcount;
        userItem.ShieldId -= Shieldcount;
        this.addressRepo.put(userAddress, userItem);
        this.PackageRepo.put(userAddress, packageItems);
        
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
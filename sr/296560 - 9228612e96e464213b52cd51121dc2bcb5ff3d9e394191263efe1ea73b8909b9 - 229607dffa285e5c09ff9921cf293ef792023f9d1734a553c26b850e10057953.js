"use strict";

// Define Hero Class
var HeroClass = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.name = obj.name;
        this.rarity = obj.rarity;
        this.role = obj.role;
        this.cla = obj.cla;
        this.supply = obj.supply;
        this.circulate = obj.circulate;
        this.minstats = obj.minstats;
        this.maxstats = obj.maxstats;
        this.attack = obj.attack;
        this.defence = obj.defence;
        this.critial = obj.critial;
        this.price = obj.price;
    } else {
        this.id = '';
        this.name = '';
        this.rarity = 0;
        this.role = 0;
        this.cla = 0;
        this.supply = 0;
        this.circulate = 0;
        this.minstats = 0;
        this.maxstats = 0;
        this.attack = 0;
        this.defence = 0;
        this.critial = 0;
        this.price = 0;
    }
};

HeroClass.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

// Define Hero
var Hero = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.cid = obj.cid;
        this.player = obj.player;
        this.name = obj.name;
        this.rarity = obj.rarity;
        this.role = obj.role;
        this.cla = obj.cla;
        this.stats = obj.stats;
        this.attack = obj.attack;
        this.defence = obj.defence;
        this.critial = obj.critial;
        this.rank = obj.rank;
        this.level = obj.level;
        this.exp = obj.exp;
    } else {
        this.id = 0;
        this.cid = 0;
        this.player = '';
        this.name = '';
        this.rarity = 0;
        this.role = 0;
        this.cla = 0;
        this.stats = 0;
        this.attack = 0;
        this.defence = 0;
        this.critial = 0;
        this.rank = 0;
        this.level = 1;
        this.exp = 0;
    }
};

Hero.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

// Define DEX Class
var DEX = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.from = obj.from;
        this.heroes = obj.heroes;
    } else {
        this.from = '';
        this.heroes = [];
    }
};

DEX.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

// Define SCROLL Class
var SCROLL = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.grand_ts = obj.grand_ts;
        this.normal_ts = obj.normal_ts;
    } else {
        this.grand_ts = null;
        this.normal_ts = null;
    }
};

SCROLL.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var LOADATA = function () {
    //HeroClass Mapping
    LocalContractStorage.defineMapProperty(this, "heroclass", {
        parse: function (text) {
            return new HeroClass(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    //Hero Mapping
    LocalContractStorage.defineMapProperty(this, "hero", {
        parse: function (text) {
            return new Hero(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    // DEX mapping - hero and player relationship
    LocalContractStorage.defineMapProperty(this, "dex", {
        parse: function (text) {
            return new DEX(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    // SCROLL mapping - open scroll
    LocalContractStorage.defineMapProperty(this, "scroll", {
        parse: function (text) {
            return new SCROLL(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LOADATA.prototype = {
    init: function () {
        // todo


        LocalContractStorage.put('admin',Blockchain.transaction.from);
        LocalContractStorage.put('totalHeroClass',0);
        LocalContractStorage.put('totalHero',0);

        // drop rates  - for runed scroll
        LocalContractStorage.put('dr_grand_legend',[1,5]);  // 5%
        LocalContractStorage.put('dr_grand_epic',[6,20]);   // 15%
        LocalContractStorage.put('dr_grand_rare',[21,50]);  // 30%
        LocalContractStorage.put('dr_grand_common',[51,70]); // 30%
        LocalContractStorage.put('dr_grand_rest',[71,100]); // 30%

        // drop rates - for normal scroll
        LocalContractStorage.put('dr_legend',[1,2]);  // 3%
        LocalContractStorage.put('dr_epic',[3,8]);   // 10%
        LocalContractStorage.put('dr_rare',[9,19]);  // 15%
        LocalContractStorage.put('dr_common',[20,35]); // 22%
        LocalContractStorage.put('dr_rest',[36,100]); // 50%

        // adminAddHeroClass(1,'Illidan Stormrage',"4","2","2","10","91","100","0");
        // adminAddHeroClass(2,'Thrall',"3","3","10","100","75","90","0");
        // adminAddHeroClass(3,'Jaina Proudmoore',"2","2","5","1000","60","74","0");

        var heroClass = new HeroClass();
        heroClass.id = 1;
        heroClass.name = "Illidan Stormrage";
        heroClass.rarity = 4;
        heroClass.role = 2;
        heroClass.cla = 2;
        heroClass.supply = 100;
        heroClass.circulate = 0;
        heroClass.minstats = 91;
        heroClass.maxstats = 100;
        heroClass.attack = 200;
        heroClass.defence = 150;
        heroClass.critical = 0.05;
        heroClass.price = 0;
        this.heroclass.put(1, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 2;
        heroClass.name = "Thrall";
        heroClass.rarity = 3;
        heroClass.role = 3;
        heroClass.cla = 10;
        heroClass.supply = 300;
        heroClass.circulate = 0;
        heroClass.minstats = 75;
        heroClass.maxstats = 90;
        heroClass.attack = 140;
        heroClass.defence = 140;
        heroClass.critical = 0.02;
        heroClass.price = 0;
        this.heroclass.put(2, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 3;
        heroClass.name = "Jaina Proudmoore";
        heroClass.rarity = 2;
        heroClass.role = 2;
        heroClass.cla = 5;
        heroClass.supply = 500;
        heroClass.circulate = 0;
        heroClass.minstats = 60;
        heroClass.maxstats = 74;
        heroClass.attack = 145;
        heroClass.defence = 105;
        heroClass.critical = 0.01;
        heroClass.price = 0;
        this.heroclass.put(3, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 4;
        heroClass.name = "Garrosh Hellscream";
        heroClass.rarity = 1;
        heroClass.role = 1;
        heroClass.cla = 12;
        heroClass.supply = 1000;
        heroClass.circulate = 0;
        heroClass.minstats = 50;
        heroClass.maxstats = 59;
        heroClass.attack = 100;
        heroClass.defence = 120;
        heroClass.critical = 0.01;
        heroClass.price = 0;
        this.heroclass.put(4, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 5;
        heroClass.name = "Anduin Wrynn";
        heroClass.rarity = 1;
        heroClass.role = 3;
        heroClass.cla = 8;
        heroClass.supply = 1000;
        heroClass.circulate = 0;
        heroClass.minstats = 50;
        heroClass.maxstats = 59;
        heroClass.attack = 100;
        heroClass.defence = 120;
        heroClass.critical = 0.01;
        heroClass.price = 0;
        this.heroclass.put(5, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 6;
        heroClass.name = "Gul'dan";
        heroClass.rarity = 2;
        heroClass.role = 2;
        heroClass.cla = 11;
        heroClass.supply = 500;
        heroClass.circulate = 0;
        heroClass.minstats = 60;
        heroClass.maxstats = 74;
        heroClass.attack = 135;
        heroClass.defence = 115;
        heroClass.critical = 0.01;
        heroClass.price = 0;
        this.heroclass.put(6, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 7;
        heroClass.name = "Kael'thas Sunstrider";
        heroClass.rarity = 1;
        heroClass.role = 2;
        heroClass.cla = 5;
        heroClass.supply = 1000;
        heroClass.circulate = 0;
        heroClass.minstats = 50;
        heroClass.maxstats = 59;
        heroClass.attack = 115;
        heroClass.defence = 105;
        heroClass.critical = 0.01;
        heroClass.price = 0;
        this.heroclass.put(7, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 8;
        heroClass.name = "Malfurion Stormrage";
        heroClass.rarity = 3;
        heroClass.role = 3;
        heroClass.cla = 3;
        heroClass.supply = 300;
        heroClass.circulate = 0;
        heroClass.minstats = 75;
        heroClass.maxstats = 90;
        heroClass.attack = 130;
        heroClass.defence = 150;
        heroClass.critical = 0.02;
        heroClass.price = 0;
        this.heroclass.put(8, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 9;
        heroClass.name = "Rexxar";
        heroClass.rarity = 2;
        heroClass.role = 2;
        heroClass.cla = 4;
        heroClass.supply = 500;
        heroClass.circulate = 0;
        heroClass.minstats = 60;
        heroClass.maxstats = 74;
        heroClass.attack = 110;
        heroClass.defence = 140;
        heroClass.critical = 0.01;
        heroClass.price = 0;
        this.heroclass.put(9, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 10;
        heroClass.name = "The Lich King";
        heroClass.rarity = 4;
        heroClass.role = 1;
        heroClass.cla = 1;
        heroClass.supply = 100;
        heroClass.circulate = 0;
        heroClass.minstats = 91;
        heroClass.maxstats = 100;
        heroClass.attack = 160;
        heroClass.defence = 190;
        heroClass.critical = 0.05;
        heroClass.price = 0;
        this.heroclass.put(10, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 11;
        heroClass.name = "Sylvanas Windrunner";
        heroClass.rarity = 3;
        heroClass.role = 2;
        heroClass.cla = 2;
        heroClass.supply = 300;
        heroClass.circulate = 0;
        heroClass.minstats = 75;
        heroClass.maxstats = 90;
        heroClass.attack = 155;
        heroClass.defence = 125;
        heroClass.critical = 0.02;
        heroClass.price = 0;
        this.heroclass.put(11, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 12;
        heroClass.name = "Uther the lightbringer";
        heroClass.rarity = 3;
        heroClass.role = 1;
        heroClass.cla = 7;
        heroClass.supply = 300;
        heroClass.circulate = 0;
        heroClass.minstats = 75;
        heroClass.maxstats = 90;
        heroClass.attack = 130;
        heroClass.defence = 150;
        heroClass.critical = 0.02;
        heroClass.price = 0;
        this.heroclass.put(12, heroClass);


        heroClass = new HeroClass();
        heroClass.id = 13;
        heroClass.name = "Valeera";
        heroClass.rarity = 1;
        heroClass.role = 2;
        heroClass.cla = 9;
        heroClass.supply = 1000;
        heroClass.circulate = 0;
        heroClass.minstats = 50;
        heroClass.maxstats = 59;
        heroClass.attack = 120;
        heroClass.defence = 100;
        heroClass.critical = 0.01;
        heroClass.price = 0;
        this.heroclass.put(13, heroClass);

        heroClass = new HeroClass();
        heroClass.id = 14;
        heroClass.name = "Vol'jin";
        heroClass.rarity = 1;
        heroClass.role = 2;
        heroClass.cla = 4;
        heroClass.supply = 1000;
        heroClass.circulate = 0;
        heroClass.minstats = 50;
        heroClass.maxstats = 59;
        heroClass.attack = 100;
        heroClass.defence = 120;
        heroClass.critical = 0.01;
        heroClass.price = 0;
        this.heroclass.put(14, heroClass);



        LocalContractStorage.put("totalHeroClass",14);
    },



    adminAddHeroClass: function (id, name, rarity, role, cla, supply, minstats, maxstats, attack, defence, critial, price) {

        var from = Blockchain.transaction.from;

        // // check if it is admin
        // var admin = this.admin;
        // if(admin === "")
        // {
        //     this.admin = from;
        // }else{
        //     if(admin!=from)
        //     {
        //         throw new Error("Admin Access Only");
        //     }
        // }
        

        // prepare the data
        id = id.trim();
        name = name.trim();
        if (id === "" || name === ""){
            throw new Error("empty data");
        }
        if (id.length > 64 || name.length > 64){
            throw new Error("data exceed limit length")
        }

        var heroClass = this.heroclass.get(id);
        if (heroClass){
            throw new Error("hero classID has been added before");
        }

        heroClass = new HeroClass();
        heroClass.id = parseInt(id);
        heroClass.name = name;
        heroClass.rarity = parseInt(rarity);
        heroClass.role = parseInt(role);
        heroClass.cla = parseInt(cla);
        heroClass.supply = parseInt(supply);
        heroClass.circulate = 0;
        heroClass.minstats = parseInt(minstats);
        heroClass.maxstats = parseInt(maxstats);
        heroClass.attack = parseInt(attack);
        heroClass.defence = parseInt(defence);
        heroClass.critical = parseFloat(critical).toFixed(2);
        heroClass.price = parseFloat(price).toFixed(6);

        this.heroclass.put(id, heroClass);

        // increase total number of heroClass
        var totalHeroClass = LocalContractStorage.get('totalHeroClass');
        LocalContractStorage.put("totalHeroClass",(totalHeroClass + 1));

    },

    getHeroClass: function (id) {
        id = id.trim();
        if ( id === "" ) {
            throw new Error("empty id")
        }
        return this.heroclass.get(id);
    },

    openScroll: function (id) {

        var from = Blockchain.transaction.from;

        if (id === "" ){
            throw new Error("invalid scroll object");
        }

        var scroll = this.scroll.get(from);

        var validScroll = false;
        if(scroll)
        {
            
            if(id == "1") // grand scroll
            {
                if(scroll.grand_ts)
                {
                    var hours = Math.abs(Date.now() - scroll.grand_ts) / 360000;
                    if(hours>=24)
                    {
                        validScroll = true;
                    }else{
                        validScroll = false;
                    }
                }else{
                    validScroll = true; // first open
                }

            }else if(id == "2"){ 
                if(scroll.normal_ts)
                {
                    //var hours = Math.abs(Date.now() - scroll.normal_ts) / 360000;   //360000

                    var minutes = Math.abs(Date.now() - scroll.normal_ts) / 60000;
                    if(minutes>=60) // open very minute
                    {
                        validScroll = true;
                    }else{
                        validScroll = false;
                    }
                }else{
                    validScroll = true; // first open
                }

            }
        }else{
            validScroll = true;
        }

        if(validScroll)
        {
            if(!scroll)
            {
                scroll = new SCROLL();
            }
            if(id == "1") // grand scroll
            {
                scroll.grand_ts = Date.now();

            }else if(id == "2") // normal scroll
            {
                scroll.normal_ts = Date.now();
            }

            this.scroll.put(from,scroll);

            var dr_result = Math.floor(Math.random()*(100-1+1)+1); // get random

            var rarity = 0;

            if(id == "1") // grand scroll
            {
                var dr_grand_legend = LocalContractStorage.get('dr_grand_legend');
                var dr_grand_epic = LocalContractStorage.get('dr_grand_epic');
                var dr_grand_rare = LocalContractStorage.get('dr_grand_rare');
                var dr_grand_common = LocalContractStorage.get('dr_grand_common');

                if(dr_result>=dr_grand_legend[0] && dr_result <= dr_grand_legend[1])
                {
                    rarity = 4;
                }else if(dr_result>=dr_grand_epic[0] && dr_result <= dr_grand_epic[1])
                {
                    rarity = 3;
                }else if(dr_result>=dr_grand_rare[0] && dr_result <= dr_grand_rare[1])
                {
                    rarity = 2;
                }else if(dr_result>=dr_grand_common[0] && dr_result <= dr_grand_common[1])
                {
                    rarity = 1;
                }

            }else if(id == "2") // normal scroll
            {
                var dr_legend = LocalContractStorage.get('dr_legend');
                var dr_epic = LocalContractStorage.get('dr_epic');
                var dr_rare = LocalContractStorage.get('dr_rare');
                var dr_common = LocalContractStorage.get('dr_common');

                if(dr_result>=dr_legend[0] && dr_result <= dr_legend[1])
                {
                    rarity = 4;
                }else if(dr_result>=dr_epic[0] && dr_result <= dr_epic[1])
                {
                    rarity = 3;
                }else if(dr_result>=dr_rare[0] && dr_result <= dr_rare[1])
                {
                    rarity = 2;
                }else if(dr_result>=dr_common[0] && dr_result <= dr_common[1])
                {
                    rarity = 1;
                }
            }

            

            var cid = 0;
            var selectIndex = 0;
            if(rarity > 0)
            {
                var totalHeroClass = LocalContractStorage.get('totalHeroClass');

                var selectedCLA = [];

                for (var i = 1; i <= totalHeroClass; i++) { 
                    var heroclass = this.heroclass.get(i);
                    if(heroclass)
                    {
                       if(heroclass.rarity === rarity && heroclass.circulate<heroclass.supply)
                       {
                          selectedCLA[selectedCLA.length] = heroclass.id;
                       }
                    }
                }

                if(selectedCLA.length > 0)
                {

                    selectIndex = Math.floor(Math.random()*((selectedCLA.length-1)-0+1)+0); 

                    cid = selectedCLA[selectIndex];
                }


            }

            // debug

            // var name = "";
            // var heroclass = this.heroclass.get(cid);

            // if(heroclass)
            // {
            //     name = heroclass.name
            // }

            // throw new Error("r:" + dr_result + " | rarity:" + rarity + " | index:" + selectIndex  + " | cid:" + cid  + " | name:" + name);



            // get hero class

            if(cid>0)
            {
                var heroclass = this.heroclass.get(cid);

                if(heroclass)
                {
                    
                    var totalHero = LocalContractStorage.get('totalHero');
                    totalHero = totalHero + 1;
                    LocalContractStorage.put("totalHero",totalHero);

                    var stats = Math.floor(Math.random()*(heroclass.maxstats-heroclass.minstats+1)+heroclass.minstats); 

                    var hero = this.hero.get(totalHero);
                    if (hero){
                        throw new Error("hero ID has been added before");
                    }

                    if(heroclass.circulate >=heroclass.supply)
                    {
                        throw new Error("hero has reached the maximum number");

                    }
                    hero = new Hero();
                    hero.id = totalHero;
                    hero.cid = cid;
                    hero.player = from;
                    hero.name = heroclass.name;
                    hero.rarity = heroclass.rarity;
                    hero.role = heroclass.role;
                    hero.cla = heroclass.cla;
                    hero.stats = stats;
                    hero.attack = (heroclass.attack + (stats * 1.1));
                    hero.defence = (heroclass.defence + (stats * 1.1));
                    hero.critical = heroclass.critical;
                    hero.rank = 0;
                    hero.level = 1;
                    hero.exp = 0;
                    this.hero.put(totalHero, hero);

                    // update heroclass circulate
                    heroclass.circulate = heroclass.circulate + 1;
                    this.heroclass.put(cid, heroclass);

                    // get dex
                    var dex = this.dex.get(from);
                    if (dex){

                        var heroes = dex.heroes;
                        heroes[heroes.length] = totalHero;
                        dex.heroes = heroes;
                        
                    }else{
                        dex = new DEX();
                        dex.from = from;
                        var heroes = new Array();
                        heroes[0] = totalHero;
                        dex.heroes = heroes;
                    }

                    this.dex.put(from,dex);

                    return this.totalHero;
                }
            }
            
        }else{
            throw new Error("Cannot open scroll");
        }

            // var stats = Math.floor(Math.random()*(heroclass.maxstats-heroclass.minstats+1)+heroclass.minstats); 

            // var hero = this.hero.get(totalHero);
            // if (hero){
            //     throw new Error("hero ID has been added before");
            // }

            // if(heroclass.circulate >=heroclass.supply)
            // {
            //     throw new Error("hero has reached the maximum number");

            // }
            // hero = new Hero();
            // hero.id = totalHero;
            // hero.cid = cid;
            // hero.player = from;
            // hero.name = heroclass.name;
            // hero.rarity = heroclass.rarity;
            // hero.role = heroclass.role;
            // hero.cla = heroclass.cla;
            // hero.stats = stats;
            // hero.level = 1;
            // hero.exp = 0;
            // this.hero.put(totalHero, hero);

            // // update heroclass circulate
            // heroclass.circulate = heroclass.circulate + 1;
            // this.heroclass.put(cid, heroclass);

            // // get dex
            // var dex = this.dex.get(from);
            // if (dex){

            //     var heroes = dex.heroes;
            //     heroes[heroes.length] = totalHero;
            //     dex.heroes = heroes;
                
            // }else{
            //     dex = new DEX();
            //     dex.from = from;
            //     var heroes = new Array();
            //     heroes[0] = totalHero;
            //     dex.heroes = heroes;
            // }

            // this.dex.put(from,dex);

            // return this.totalHero;

        return scroll;
        
    },

    // createHero: function (cid) {

    //     var from = Blockchain.transaction.from;

    //     if (cid === "" ){
    //         throw new Error("empty data");
    //     }

    //     var heroclass = this.heroclass.get(cid);

    //     if(heroclass)
    //     {
            
    //         var totalHero = LocalContractStorage.get('totalHero');
    //         totalHero = totalHero + 1;
    //         LocalContractStorage.put("totalHero",totalHero);

    //         var stats = Math.floor(Math.random()*(heroclass.maxstats-heroclass.minstats+1)+heroclass.minstats); 

    //         var hero = this.hero.get(totalHero);
    //         if (hero){
    //             throw new Error("hero ID has been added before");
    //         }

    //         if(heroclass.circulate >=heroclass.supply)
    //         {
    //             throw new Error("hero has reached the maximum number");

    //         }
    //         hero = new Hero();
    //         hero.id = totalHero;
    //         hero.cid = cid;
    //         hero.player = from;
    //         hero.name = heroclass.name;
    //         hero.rarity = heroclass.rarity;
    //         hero.role = heroclass.role;
    //         hero.cla = heroclass.cla;
    //         hero.stats = stats;
    //         hero.level = 1;
    //         hero.exp = 0;
    //         this.hero.put(totalHero, hero);

    //         // update heroclass circulate
    //         heroclass.circulate = heroclass.circulate + 1;
    //         this.heroclass.put(cid, heroclass);

    //         // get dex
    //         var dex = this.dex.get(from);
    //         if (dex){

    //             var heroes = dex.heroes;
    //             heroes[heroes.length] = totalHero;
    //             dex.heroes = heroes;
                
    //         }else{
    //             dex = new DEX();
    //             dex.from = from;
    //             var heroes = new Array();
    //             heroes[0] = totalHero;
    //             dex.heroes = heroes;
    //         }

    //         this.dex.put(from,dex);

    //         return this.totalHero;
    //     }
    // },

    getPlayerArmy: function () {
        var from = Blockchain.transaction.from;
        var dex = this.dex.get(from);
        var heroDB = this.hero;
        var heroes = [];
        if(dex)
        {
            if(dex.heroes)
            {
                dex.heroes.forEach(function(item){

                    var hero = heroDB.get(item);
                    if (hero){
                        heroes[heroes.length] = hero;
                        
                    }
                })  
            }
        }
        return heroes;
    },

    getScroll: function () {
       var from = Blockchain.transaction.from;
       var scroll = this.scroll.get(from);
       return scroll;
    },
    getDEX: function (id) {
       var from = Blockchain.transaction.from;
       var dex = this.dex.get(from);
       return dex;
    },

    getHero: function (id) {
        id = id.trim();
        if ( id === "" ) {
            throw new Error("empty id")
        }
        return this.hero.get(id);
    },

    getHeroClass: function (id) {
        id = id.trim();
        if ( id === "" ) {
            throw new Error("empty id")
        }
        return this.heroclass.get(id);
    },

    countHeroClass: function () {
        return LocalContractStorage.get('totalHeroClass');
    },

    countHero: function () {
        return LocalContractStorage.get('totalHero');
    }
};
module.exports = LOADATA;
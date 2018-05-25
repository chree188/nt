"use strict";


var CellHistory = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        //basic info
        this.number = obj.number;
        //cell info
        this.cellno = obj.cellno;
        this.adaption = obj.adaption;
        this.surviveability = obj.surviveability;
        this.division = obj.division;
        this.environment = obj.environment;
        this.day = obj.day;
        this.totoalscore = obj.totoalscore;
        this.deadcell = obj.deadcell;
    } else {
        this.number = 1;
        this.cellno = 0;
        this.adaption = 0;
        this.surviveability = 0;
        this.division = 0;
        this.environment = 0;
        this.day = 0;
        this.totoalscore = 0;
        this.deadcell = 0;
    }
};
CellHistory.prototype = {
toString: function () {
    return JSON.stringify(this);
}
};

var CellEvolution = function(text) {
	if (text) {
		var obj = JSON.parse(text);
        //basic info
        this.id = obj.id;
//		this.name = obj.name;
        this.creator = obj.creator;
//
        //cell info
        this.cellno = obj.cellno;
        this.adaption = obj.adaption;
        this.surviveability = obj.surviveability;
        this.division = obj.division;
        this.environment = obj.environment;
        this.day = obj.day;
        this.totoalscore = obj.totoalscore;
        this.finaltitle = obj.finaltitle;
        this.belong = obj.belong;
        
   } else {
       this.id = "";
//       this.name =  "";
       this.creator =  "";
       this.cellno = "";
       this.adaption = "";
       this.surviveability = "";
       this.division = "";
       this.environment = "";
       this.day = "";
       this.totoalscore = "";
       this.finaltitle = "";
       this.belong=0;
	}
};

CellEvolution.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var CellDB = function () {
    LocalContractStorage.defineProperties(this,{
                                          isOpen: null,
                                          admAdd: null,
                                          totalcell:null,
                                          balance:null,
                                          historyno:null
                                          });
    
    LocalContractStorage.defineMapProperty(this,"cellhistory",{
                                          parse: function (text) {
                                          return new CellHistory(text);
                                          },
                                          stringify: function (o) {
                                          return o.toString();
                                          }
                                          });
    
    LocalContractStorage.defineMapProperty(this, "celldb", {
        parse: function (text) {
            return new CellEvolution(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

CellDB.prototype = {
    init: function () {
        this.admAdd="n1NJaHRXpe49fc98GtuxxYVFyq1xsYCHx9d";
        this.isOpen = true;
        this.totalcell = 0;
        this.balance = new BigNumber(0);
        this.historyno = 0;
        var cellworld =new CellHistory();
        this.cellhistory.put(this.historyno,cellworld);
//        this.cellhistory.put(id, cell);
        // todo
    },
    //view 拿信息
    gethistoryno: function() {
        return this.historyno;
    },
    
    getIsOpen: function() {
        return this.isOpen;
    },
    gettotalcell: function() {
        return this.totalcell;
    },
    
    getAdminAddress: function() {
        return this.admAdd;
    },
    //设置开始
    setIsOpen: function(isopen) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.isOpen = isopen;
        } else {
            throw new Error("Admin only");
        }
    },
 
donate:function(){
    var bvalue = new BigNumber(Blockchain.transaction.value);
    this.balance = bvalue.add(this.balance);
 
},

//, cellno, adaption, surviveability, division, environment, day, totoalscore, finaltitle
    dnamerge: function (id, cellno, adaption, surviveability, division, environment, day, totoalscore, finaltitle) {
        //鉴定开始
        if (!this.isOpen) {
            throw new Error("Game is currently closed");
        }
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var bvalue = new BigNumber(Blockchain.transaction.value);
        if (value < 0.0001) {
            throw new Error("not enough to merge");
        }
           this.balance = bvalue.add(this.balance);
        
        //trim
        
        
        id = id.trim();
        
        
        cellno = cellno.trim();
        adaption = adaption.trim();
        surviveability = surviveability.trim();
        division = division.trim();
        environment = environment.trim();
        day = day.trim();
        totoalscore = totoalscore.trim();
        finaltitle = finaltitle.trim();
//
        
        if (id === ""){
            throw new Error("empty id");
        }

        var from = Blockchain.transaction.from;
        var cell = this.celldb.get(id);
        if (cell){
            throw new Error("system error");
        }
        this.totalcell++;
        
        cell = new CellEvolution();
        
        
        cell.id = id;
        cell.creator = from;
//        cell.name = name;
        cell.cellno = cellno;
        cell.adaption = adaption;
        cell.surviveability = surviveability;
        cell.division = division;
        cell.environment = environment;
        cell.day = day;
        cell.totoalscore = totoalscore;
        cell.finaltitle = finaltitle;
        cell.belong = this.historyno;
        this.celldb.put(id, cell);
        
        var newcellworld = this.cellhistory.get(this.historyno);
        newcellworld.number = parseInt(id);
        newcellworld.cellno = parseInt(newcellworld.cellno) + parseInt(cellno);
        newcellworld.adaption = parseInt(newcellworld.adaption) + parseInt(adaption);
        newcellworld.surviveability = parseInt(newcellworld.surviveability) + parseInt(surviveability);
        newcellworld.division = parseInt(newcellworld.division) + parseInt(division);
        newcellworld.environment = parseInt(newcellworld.environment) + parseInt(environment);
        newcellworld.day = parseInt(newcellworld.day) + parseInt(day);
        newcellworld.totoalscore = parseInt(newcellworld.totoalscore) + parseInt(totoalscore);
        
        this.cellhistory.set(this.historyno,newcellworld);
        
        this.checkdeath(newcellworld.cellno,newcellworld.adaption,newcellworld.surviveability,newcellworld.division);
        
        var tvalue = new BigNumber(this.balance);
        var result = Blockchain.transfer(from, tvalue.times(0.01));
        this.balance = tvalue.times(0.99);
       
    },
//
    checkdeath: function(cellno,adaption,surviveability,division){
        if(cellno > 10000){
            //如果没有平衡发展
              var balancecheck = (adaption+ surviveability+ division)/3;
            if( (adaption <= balancecheck*1.5) && (adaption >= balancecheck*0.5) && (surviveability <= balancecheck*1.5) &&

               (surviveability >= balancecheck*0.5) && (division <= balancecheck * 1.5) && (division >= balancecheck*0.5) ){
                //平衡发展，很OK
            }else{
                //die
                this.historyno++;
                var cellworld =new CellHistory();
                cellworld.number = parseInt(this.totalcell)+1;
                cellworld.cellno = 0;
                cellworld.adaption = 0;
                cellworld.surviveability = 0;
                cellworld.division =0;
                cellworld.environment =0;
                cellworld.day = 0;
                cellworld.totoalscore = 0;
                cellworld.deadcell = this.historyno;
                this.cellhistory.put(this.historyno,cellworld);
            }
        }

    },
getbalance: function () {

        return this.balance;
    },
    getworld: function (historyno) {
        historyno = historyno.trim();
        if ( historyno === "" ) {
            throw new Error("empty key")
        }
        return this.cellhistory.get(this.historyno);
    },
    get: function (id) {
        id = id.trim();
        if ( id === "" ) {
            throw new Error("empty key")
        }
        return this.celldb.get(id);
    }
};
module.exports = CellDB;

"use strict";

var ParkingModel = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.parkaddress = obj.parkaddress;
		this.address = obj.address;
		this.parkingname = obj.parkingname;
		this.spacenum = obj.spacenum;
		this.charge = obj.charge;
		this.starttime = obj.starttime;
		this.note = obj.note;
	} else {
	    this.parkaddress = '';
	    this.address = '';
	    this.parkingname = '';
		this.spacenum = '';
		this.charge = '';
		this.starttime = '';
		this.note = '';
	}
};

ParkingModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var CarModel = function(text){
	if (text) {
		var obj = JSON.parse(text);
		this.carnum = obj.carnum;
		this.timein = obj.timein;
		this.timeout = obj.timeout;
		this.pay = obj.pay;
		this.paytime = obj.paytime;
		this.nature = obj.nature;
		this.type = obj.type;
		this.caraddress = obj.caraddress;
		this.isin = obj.isin;
		this.note = obj.note;
	} else {
		this.carnum = '';
		this.timein = '';
		this.timeout = '';
		this.pay = '';
		this.paytime = '';
		this.nature = '';
		this.type = '';
		this.caraddress = '';
		this.isin = '';
		this.note = '';
	}
}

CarModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var ParkingContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new ParkingModel(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "carList");
    LocalContractStorage.defineMapProperty(this, "carRepo");
};

ParkingContract.prototype = {
    init: function () {
        // todo
    },
    // parking create
    save: function (parkaddress,address,parkingname,spacenum,charge,note) {

		parkaddress = parkaddress.trim();
    		address = address.trim();
    		parkingname = parkingname.trim();
    		spacenum = spacenum.trim();
    		charge = charge.trim();
		note = note.trim();
        if (parkaddress === "" || address === "" || parkingname === "" || spacenum === "" || charge === "" || note === "" ){
            throw new Error("empty parkaddress / address / parkingname / spacenum / charge / note");
        }

        var parkingModel = this.repo.get(parkaddress) || new ParkingModel();
        parkingModel.parkaddress = parkaddress;
        parkingModel.address = address;
        parkingModel.parkingname = parkingname;
    		parkingModel.spacenum = spacenum;
        parkingModel.charge = charge;
       	if (parkingModel.starttime == '') {
       		var start_time = Blockchain.block.timestamp;
       		parkingModel.starttime = start_time;
       	}
        parkingModel.note = note;
    		this.repo.set(parkaddress,parkingModel);
   },
    getPark: function (paddress) {
        paddress = paddress.trim();
        if ( paddress === "" ) {
            throw new Error("empty paddress")
        }
        return this.repo.get(paddress);
    },
    // parking free spaces
    freeSpace: function (paddress) {
    		var carList = this.getCarList(paddress);
    		var parkingModel = this.getPark(paddress);
    		var space = 0;
    		for (var key in carList) {
    			if (carList[key].isin == 1) {
    				space++;
    			}
    		}
    		return parseInt(parkingModel.spacenum) - space;
    },
    // car in
    saveCar: function (carnum,nature,type,caraddress,parkaddress,note) {
    	// if spaces fully, throw error
 		if (this.freeSpace(parkaddress) < 0) {
 			throw new Error('parking space is full');
 		}
    		carnum = carnum.trim();
    		nature = nature.trim();
    		type = type.trim();
    		caraddress = caraddress.trim();
    		note = note.trim();
    		var carList = this.getCarList(parkaddress);
        var carModel = carList[carnum] || new CarModel();
        if (carModel.isin == '1') {
        		throw new Error('error insert , car in parking');
        }
        var time_in = Blockchain.block.timestamp;
        carModel.carnum = carnum;
        carModel.timein = time_in;
        carModel.nature = nature;
        carModel.type = type;
        carModel.caraddress = caraddress;
        carModel.isin = '1';
        carModel.note = note;
        carList[carnum] = carModel;
        	this.carList.put(parkaddress,carList);
		var carRepoList = this.getCarRepoList(parkaddress);
		carRepoList.push(carModel);
		this.carRepo.put(parkaddress,carRepoList);
    },
    // car out
    delcar: function (carnum,paddress,pay) {
    		var carList = this.getCarList(paddress);
    		var carModel = carList[carnum];
    		carModel.timeout = Blockchain.block.timestamp;
    		carModel.isin = '0';
    		// Calculation
		    carModel.pay = pay;
    		carList[carnum] = carModel;
    		this.carList.put(paddress,carList);
    		// car info change
    		var carRepoList = this.getCarRepoList(paddress);
    		carRepoList.push(carModel);
    		this.carRepo.put(paddress,carRepoList);
    		return carModel;
    },
    // get car list
    getCarList:function (paddress) {
    		return this.carList.get(paddress) || {};
    },
    // get car report list
    getCarRepoList:function (paddress) {
    		return this.carRepo.get(paddress) || [];
    },
	// get car info
    queryCar: function (carnum,paddress) {
        paddress = paddress.trim();
        carnum = carnum.trim();
        if ( carnum === "" ) {
            throw new Error("empty car")
        }
        if ( paddress === "" ) {
            throw new Error("empty parking");
        }
        var carList = this.getCarList(paddress);
        return carList[carnum];
    },
    // delete area 1 parking \ 2 car list \ 3 car report list
    del:function(area,paddress,caddress){
    		if (area == '1') {
    			this.repo.del(paddress);
    			throw new Error('parking delete success');
    		}else if (area == '2') {
    			this.carList.del(paddress);
    			throw new Error('car list delete success');
    		}else if (area == '3') {
    			this.carRepo.del(paddress);
    			throw new Error('car repo list delete success');
    		}
    },

    rent:function (pay,paddress,carnum) {
    		pay = pay.trim();
    		if (!!pay) {
    			throw new Error('no pay insert');
    		}
    		var carList = this.getCarList(paddress);
    		var carModel = carList[carnum];
    		var paytime = Blockchain.block.timestamp;
    		carModel.pay = pay;
    		carModel.paytime = paytime;
    		carList[carnum] = carModel;
        	this.carList.put(parkaddress,carList);
    },
    // count
    count:function(nature,type,paddress,caddress,timein,timeout) {
    		if (nature == '3') {
    			return 0;
    		};
    		var parkingModel = this.repo.get(paddress);
    		var charge = JSON.parse(parkingModel.charge);
    		var time_in = parseInt(timein);
    		var time_out = parseInt(timeout);
    		var unit = parseInt(charge[nature][type]);
    		var hor = 60*60;
    		var day = 60*60*24;
    		if (charge.per == '1') { //per
    			if (nature == '1') {
    				return ((time_in/day) - (time_out/day) + 1)*unit;
    			}else if (nature == '2') {
    				return 0;
    			}
    		}else if (charge.per == '2') { //time
    			if (nature == '1') {
    				var a = (day - time_in % day)/(hor/2);
    				var b = (time_in%day)/(hor/2);
    				var limit = parseInt(charge.limit);
    				var maxPrice = parseFloat(charge['maxPrice']['type']);
    				var timein_money = (a > limit ? maxPrice : unit*a/2);
    				var timeout_money = (b > limit ? maxPrice : unit*b/2);
    				var allday = time_out/day - time_in/day;
    				if (allday == 0) {
    					var curday = (time_out - time_in)/(hor/2);
    					var time_money = (curday > limit ? maxPrice : unit*curday/2);
    					return time_money;
    				}
    				return timein_money + allday*maxPrice + timeout_money;
    			}else if (nature == '2') {
    				return 0;
    			}
    		}
    }
};

module.exports = ParkingContract;
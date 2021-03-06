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
		this.pword = obj.pword;
	} else {
	    this.parkaddress = '';
	    this.address = '';
	    this.parkingname = '';
		this.spacenum = '';
		this.charge = '';
		this.starttime = '';
		this.note = '';
		this.pword = '';
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
    save: function (parkaddress,pword,address,parkingname,spacenum,charge,note) {

		parkaddress = parkaddress.trim();
    		address = address.trim();
    		parkingname = parkingname.trim();
    		spacenum = spacenum.trim();
    		charge = charge.trim();
		note = note.trim();
		pword = pword.trim();
        if (parkaddress === "" || address === "" || parkingname === "" || spacenum === "" || charge === "" || note === "" || pword === "" ){
            throw new Error("empty parkaddress / address / parkingname / spacenum / charge / note");
        }

        var parkingModel = this.repo.get(parkaddress) || new ParkingModel();
        parkingModel.parkaddress = parkaddress;
        parkingModel.address = address;
        parkingModel.parkingname = parkingname;
    		parkingModel.spacenum = spacenum;
        parkingModel.charge = charge;
        parkingModel.pword = pword;
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
        carModel.paytime = Blockchain.block.timestamp;
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
    }
};

module.exports = ParkingContract;
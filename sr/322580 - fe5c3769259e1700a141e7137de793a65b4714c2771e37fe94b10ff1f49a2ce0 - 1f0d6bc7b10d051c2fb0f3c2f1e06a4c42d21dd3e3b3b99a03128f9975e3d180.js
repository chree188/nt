"use strict";

var CarLife = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.no = obj.no;
		this.car_type = obj.car_type;
        this.car_onwer = obj.car_onwer;
        this.car_time = obj.car_time;
        this.car_log = obj.car_log;
	} else {
        this.no = "";
		this.car_type = "";
        this.car_onwer = "";
        this.car_time = "";
        this.car_log = "";
	}
};

CarLife.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var CarLife = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new CarLife(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

CarLife.prototype = {
    init: function () {
    },
    recordCar: function (no , car_type, car_time) {
        //过滤
        no = no.trim();
        car_type = no.trim();
        car_time = no.trim();

        var car = this.getCarInfo(no);
        if(car){
            return "该车辆信息已经添加。请勿重复添加";
        }
        car = new CarLife()
        car.no = no;
        car.car_type = car_type;
        car.car_time = car_time;
        car.car_onwer = Blockchain.transaction.from;
        this.repo.put(no,car);
    },

    updateCarLog: function (no, carlog){
        var car = this.getCarInfo(no);
        if (car){
            if(car.log == ""){
                car.car_log = carlog;
            }else {
                car.car_log = car.car_log + "||" + carlog;
            }
            this.repo.put(no, car);
            return car.toString();
        }else {
            return "未查询到车辆信息，请先添加车辆信息";
        }
    },

    getCarInfo: function (no) {
        no = no.trim();
        if ( no === "" ) {
            return "输入车辆信息有误";
        }
        return this.repo.get(no);
    }
};
module.exports = CarLife;
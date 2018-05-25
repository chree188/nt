'use strict';

var Car = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.idx = o.idx;
    this.name = o.name;
    this.brand = o.brand;
    this.dealTime = o.dealTime;
    this.addTime = o.addTime;
    this.carId = o.carId;
    this.description = o.description;
  }
};

Car.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var CarPool = function(){
	LocalContractStorage.defineProperty(this, "totalSize");
	LocalContractStorage.defineMapProperty(this, "cars", {
    parse: function (text) {
      return new Car(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
}

CarPool.prototype = {
  init: function () {
  	this.totalSize = 0;
  },

  add:function(carId,name,brand,dealTime,description){
  	var from = Blockchain.transaction.from;
  	var ts = Blockchain.transaction.timestamp;

  	var car = new Car();

  	car.idx = this.totalSize;
    car.carId = carId;
    car.name = name;
    car.brand = brand;
    car.dealTime = dealTime;
    car.addTime = ts;
    car.description = description;

  	this.cars.put(this.totalSize,car);
  	this.totalSize++;

  	return car;
  },

  getCar:function(carId){
    var list = [];
    for (var i = 0; i < this.totalSize;i++){
      var item = this.cars.get(i);
      if(item.carId == carId){
        list.push(item);
      }
    }
    return list;
  },

  getTotal:function(){
  	return this.totalSize;
  },
 }

 module.exports = CarPool;
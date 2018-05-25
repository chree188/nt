"use strict";

var MarkerContent = function(text,lat,lng) {
	this.from = Blockchain.transaction.from;
	this.text = text;
	this.lat = lat;
	this.lng = lng;
};

var MapContract = function() {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineProperty(this, "size");
};

MapContract.prototype = {
    init: function () {
    	this.size=0;
    },

	set:function(text,lat,lng){
		var from = Blockchain.transaction.from;
		var marker = new MarkerContent(text,lat,lng);
		var index = this.size;
		
		this.arrayMap.set(index, from);
		this.dataMap.set(from, marker);
		this.size++;
        return JSON.stringify(marker.from+" added, "+ marker.text);
	},

	get_all: function() {
		var fromList = [];
		var textList =[];
		var latList= [];
		var lngList = [];
		for(var i=0;i<this.size;i++) {
			var from = this.arrayMap.get(i);
			var marker = this.dataMap.get(from);			
			fromList.push(marker.from);
			textList.push(marker.text);
			latList.push(marker.lat);
			lngList.push(marker.lng);
		}
		return JSON.stringify({"fromList":fromList,"textList":textList,"latList":latList,"lngList":lngList});
	}
};

module.exports = MapContract;
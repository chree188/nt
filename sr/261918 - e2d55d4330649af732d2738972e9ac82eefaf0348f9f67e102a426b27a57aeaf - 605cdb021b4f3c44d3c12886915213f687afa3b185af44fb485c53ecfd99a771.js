"use strict";


var Record = function(text){
	if(text){
		var o = JSON.parse(text);
		this.height = parseInt(o.height);
		this.weight = parseInt(o.weight);
		this.name = o.name;
		this.age = parseInt(o.age);
		this.BMIArray = o.BMIArray;
		//this.TimeArray = o.TimeArray;
		}
	else{
		this.height = 0;
		this.weight = 0;
		this.name = "";
		this.age = 0;
		this.BMIArray = [];
		//this.TimeArray = [];
	}
};



Record.prototype = {
	toString:function(){
		return JSON.stringify(this);
	}
};



var BMIContract = function(){
	LocalContractStorage.defineMapProperty(this,"record",{
		parse: function(text){
			return new Record(text);
		},

		stringify: function(o){
			return o.toString();
		}
	});
};



BMIContract.prototype = {
	init: function(){
	},

	//bmi: function(h, w, n, a){
	bmi: function(name,age,height,weight){
		var BMI;
		if(height <= 0)
		{
			throw new Error("Height Error!");
		}
		else if(weight <= 0)
		{
		 	throw new Error("Weight Error!");
		}
		else
		{
		BMI = parseInt(weight/(height*height));
		}
		var from = Blockchain.transaction.from;
		var recordOld = this.record.get(from);
		var recordNew = new Record();
		if(recordOld)
		{
			if(name == recordOld.name)
			{
				recordNew.BMIArray = recordOld.BMIArray;
			}
		}
		recordNew.name = name;
		recordNew.age = age;
		recordNew.height = height;
		recordNew.weight = weight;
		recordNew.BMIArray.push(BMI);
		this.record.put(from,recordNew);
		//var clockTime =  new Date();
		//records.BMIArray = BMI;
		//records.TimeArray = clockTime.toString();
		//this.record.put(from, records);

		/*Event.Trigger("record",{
			Transfer:{
				from: Blockchain.transaction.to,
				to: from,
				value: value.toString()
			}
		});*/
	},

	dataOf:function(){
		var from = Blockchain.transaction.from;
		var record = this.record.get(from);
		return record.BMIArray;
	},

	verifyAddress: function(address){
		var result = Blockchain.verifyAddress(address);
		return{
			valid: result == 0 ? false : true
		};
	}
};



module.exports = BMIContract;
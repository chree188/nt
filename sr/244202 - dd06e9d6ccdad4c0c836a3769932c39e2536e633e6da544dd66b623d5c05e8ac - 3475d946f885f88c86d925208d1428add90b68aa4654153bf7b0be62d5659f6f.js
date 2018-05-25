"use strict";
	var nameItem = function(str) {
		if (str){
			var item = JSON.parse(str);
			this.name = item.name;
			this.men = item.men;
			this.women = item.women;
			this.latest_addin = item.latest_addin;
		}
		else{
			this.name = "";
			this.men = "0";
			this.women = "0";
			//this.latest_query = "";
			this.latest_addin = "";
		}
	};

	nameItem.prototype = {
		toString: function () {
			var str = JSON.stringify(this);
			//throw new Error(str);
			return str;
		}
	};

	var TheSameNames = function () {
		LocalContractStorage.defineMapProperty(this, "names", {
			parse: function (str) {
				return new nameItem(str);
			},
			stringify: function (item) {
				return item.toString();
			}
		});
		LocalContractStorage.defineMapProperty(this,"addr2name");
	};
	TheSameNames.get_time = function() {
		var date = new Date();
		var seperator1 = "-";
		var seperator2 = ":";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
				+ " " + date.getHours() + seperator2 + date.getMinutes()
				+ seperator2 + date.getSeconds();
		return currentdate;
	};
	TheSameNames.prototype = {
		init: function () {
    },

    get_name_info: function (k) {
        k = k.trim();
        if ( k === "" ) {
            throw new Error("the value is empty")
        }
        return this.names.get(k);
    },
	
    insert_to_names: function (k, v) {
        k = k.trim();
        v = v.trim();
        if (k === "" || v === ""){
            throw new Error("empty key / value");
        }
        if (k.length > 20){
            throw new Error("name is too long")
        }

        var origin_addr = Blockchain.transaction.from;
		var name = this.addr2name.get(origin_addr);
		var name_str = JSON.stringify(name);
		if(name){
			throw new Error("你的名字是：" + name_str);
		}
        var item = this.names.get(k);
        if (item)
		{
		  item.latest_addin = origin_addr + ";"+TheSameNames.get_time();
		  if(v === "male"){
			  item.men = (parseInt(item.men) + 1).toString();
		  }
		  else{
			  item.women = (parseInt(item.women) + 1).toString();
		  } 
        }
		else{
			var male_num=0;
			var female_num=0;
			if(v === "male"){
				male_num = 1;
			}
			else{
				female_num = 1;
			}
			var value = "{\"name\":\"" + k  + "\",\"latest_addin\":\"" + origin_addr+";" + TheSameNames.get_time() 
			+ "\",\"men\":\"" + male_num.toString() + "\",\"women\":\"" + female_num.toString() + "\",\"gender\":\"" + v + "\"}";
			item = new nameItem(value);		
		}
		this.names.put(k,item);
		this.addr2name.put(origin_addr,k);
    },
};
module.exports = TheSameNames;
"use strict";


var Record = function(text){
	if(text){
		var o = JSON.parse(text);
		this.after_tax_salary = parseInt(o.after_tax_salary);
		this.salary_tax = parseInt(o.salary_tax);
		this.endowment = parseInt(o.endowment);
		this.medical = parseInt(o.medical);
		this.unemployment = parseInt(o.unemployment);
		this.housing_provident_fund = parseInt(o.housing_provident_fund);

		this.salary = o.salary;

		this.after_tax_bonus = parseInt(o.after_tax_bonus);
		this.bonus_tax = parseInt(o.bonus_tax);

		this.bonus = o.bonus;
		}
	else{
		this.after_tax_salary = 0;
		this.salary_tax = 0;
		this.endowment = 0;
		this.medical = 0;
		this.unemployment = 0;
		this.housing_provident_fund =0;

		this.salary = [];

		this.after_tax_bonus = 0;
		this.bonus_tax = 0;

		this.bonus = [];
	}
};



Record.prototype = {
	toString:function(){
		return JSON.stringify(this);
	}
};



var BeijingSalary = function(){
	LocalContractStorage.defineMapProperty(this,"record",{
		parse: function(text){
			return new Record(text);
		},

		stringify: function(o){
			return o.toString();
		}
	});
};



BeijingSalary.prototype = {

	init: function(){
	},

	Salary: function(salar){
		var after_tax_salary;
		var taxable_salary;
		var salary_tax;
		var endowment;
		var medical;
		var unemployment;
		var housing_provident_fund;
		var tax_point = 3500;
		var endowment_percentage = 0.08;
		var medical_percentage = 0.02;
		var unemployment_percentage = 0.002;
		var housing_provident_fund_percentage = 0.12;

		var level_range = new Array(0,5000,10000);

		if(salar <= 0)
		{
			throw new Error("Salary can not be zero or under zero!");
		}
		else
		{
			endowment = parseInt(salar * endowment_percentage);
			medical = parseInt(salar * medical_percentage);
			unemployment = parseInt(salar * unemployment_percentage);
			housing_provident_fund = parseInt(salar * housing_provident_fund_percentage);

			taxable_salary = parseInt(salar - endowment - medical - unemployment - housing_provident_fund - tax_point);

			if(taxable_salary <= 0)
			{
				//throw new Error("Salary can not be zero or under zero!");
			}
			else if(taxable_salary > 0 && taxable_salary <= 1500)
			{
				salary_tax = parseInt(taxable_salary * 0.03 - 0);
			}
			else if(taxable_salary > 1500 && taxable_salary <= 4500)
			{
				salary_tax = parseInt(taxable_salary * 0.1 - 105);
			}
			else if(taxable_salary > 4500 && taxable_salary <= 9000)
			{
				salary_tax = parseInt(taxable_salary * 0.2 - 555);
			}
			else if(taxable_salary > 9000 && taxable_salary <=35000)
			{
				salary_tax = parseInt(taxable_salary * 0.25 - 1005);
			}
			else if(taxable_salary > 35000 && taxable_salary <= 55000)
			{
				salary_tax = parseInt(taxable_salary * 0.3 - 2755);
			}
			else if(taxable_salary > 55000 && taxable_salary <= 80000)
			{
				salary_tax = parseInt(taxable_salary * 0.35 - 5505);
			}
			else
			{
				salary_tax = parseInt(taxable_salary * 0.45 - 13505);
			}

		}

		after_tax_salary = parseInt(taxable_salary - salary_tax + tax_point);

		var from = Blockchain.transaction.from;
		var recordOld = this.record.get(from);
		var recordNew = new Record();

		if(recordOld)
		{
			recordNew.salary = recordOld.salary;
			recordNew.bonus = recordOld.bonus;
		}

		recordNew.salary.push(salar);

		recordNew.after_tax_salary = after_tax_salary;
		recordNew.salary_tax = salary_tax;
		recordNew.endowment = endowment;
		recordNew.medical = medical;
		recordNew.unemployment = unemployment;
		recordNew.housing_provident_fund = housing_provident_fund;

		this.record.put(from,recordNew);

		//return after_tax_salary;

	},


	Bonus: function(bonu){
		var after_tax_bonus;
		var bonus_tax;
		var month_bonus;

		month_bonus = parseInt(bonu/12);

		if(month_bonus <= 0)
		{
			throw new Error("Bonus can not be zero or under zero!");
		}
		else if(month_bonus > 0 && month_bonus <= 1500)
		{
			bonus_tax = parseInt(month_bonus * 0.03 - 0);
		}
		else if(month_bonus > 1500 && month_bonus <= 4500)
		{
			bonus_tax = parseInt(month_bonus * 0.1 - 105);
		}
		else if(month_bonus > 4500 && month_bonus <= 9000)
		{
			bonus_tax = parseInt(month_bonus * 0.2 - 555);
		}
		else if(month_bonus > 9000 && month_bonus <=35000)
		{
			bonus_tax = parseInt(month_bonus * 0.25 - 1005);
		}
		else if(month_bonus > 35000 && month_bonus <= 55000)
		{
			bonus_tax = parseInt(month_bonus * 0.3 - 2755);
		}
		else if(month_bonus > 55000 && month_bonus <= 80000)
		{
			bonus_tax = parseInt(month_bonus * 0.35 - 5505);
		}
		else
		{
			bonus_tax = parseInt(month_bonus * 0.45 - 13505);
		}

		bonus_tax = bonus_tax*12;
		after_tax_bonus = parseInt(bonu - bonus_tax);

		var from = Blockchain.transaction.from;
		var recordOld = this.record.get(from);
		var recordNew = new Record();

		if(recordOld)
		{
			recordNew.bonus = recordOld.bonus;
			recordNew.salary = recordOld.salary;
		}

		recordNew.bonus.push(bonu);
		recordNew.after_tax_bonus = after_tax_bonus;
		recordNew.bonus_tax = bonus_tax;

		this.record.put(from,recordNew);

		//return recordNew.bonus_tax;
	},


	dataOfSalary:function(){
		var from = Blockchain.transaction.from;
		var record = this.record.get(from);
		var pieSalary = [];
		pieSalary.push(record.after_tax_salary);
		pieSalary.push(record.salary_tax);
		pieSalary.push(record.endowment);
		pieSalary.push(record.medical);
		pieSalary.push(record.unemployment);
		pieSalary.push(record.housing_provident_fund);

		return pieSalary;
		//return record.salary;
	},

	dataOfBonus:function(){
		var from = Blockchain.transaction.from;
		var record = this.record.get(from);
		var pieBonus = [];
		pieBonus.push(record.after_tax_bonus);
		pieBonus.push(record.bonus_tax);

		return pieBonus;
		//return record.bonus;
	},

	verifyAddress: function(address){
		var result = Blockchain.verifyAddress(address);
		return{
			valid: result == 0 ? false : true
		};
	}
};



module.exports = BeijingSalary;
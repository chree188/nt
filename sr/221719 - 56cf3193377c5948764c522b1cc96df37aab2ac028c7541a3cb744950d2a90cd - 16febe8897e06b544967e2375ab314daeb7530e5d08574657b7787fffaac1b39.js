"use strict";

var calculateContract = function () {

};

calculateContract.prototype = {
    init: function () {
       
    },
	calc:function calc(iNum1, iNum2, sOpr)
	{
		var iResult=0;
		switch(sOpr)
		{
			case '×':
				iResult=iNum1*iNum2;
				break;
			case '+':
				iResult=iNum1+iNum2;
				break;
			case '-':
				iResult=iNum1-iNum2;
				break;
			case '÷':
				iResult=iNum1/iNum2;
				break;
			default:
				iResult=iNum2;
		}
		
		return iResult;
	}

};

module.exports = calculateContract;
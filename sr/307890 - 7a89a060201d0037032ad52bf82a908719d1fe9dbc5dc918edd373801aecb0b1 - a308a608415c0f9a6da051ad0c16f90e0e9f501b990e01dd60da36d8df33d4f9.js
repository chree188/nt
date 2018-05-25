'use strict';

var CalculateSalary = function () {

};
CalculateSalary.prototype = {
  init: function() {

  },

  calculate:function (amount,apr,years) {
    //金额
    var principal = parseFloat(amount);
    //年利息
    var interest = parseFloat(apr)/100/12;
    //贷款周期
    var payments = parseFloat(years)*12;

    var x = Math.pow(1+interest ,payments);
    //每月还款金额
    var monthly = (principal * x * interest)/(x-1);
    //每月支付
    var payment = monthly.toFixed(2);
    //总支付
    var total = (monthly * payments).toFixed(2);
    //总利息
    var totalinterest = (monthly * payments - principal).toFixed(2);

    var result = {};
    result.payment=payment;
    result.total=total;
    result.totalinterest=totalinterest;

    return result;
  }
};
module.exports = CalculateSalary;

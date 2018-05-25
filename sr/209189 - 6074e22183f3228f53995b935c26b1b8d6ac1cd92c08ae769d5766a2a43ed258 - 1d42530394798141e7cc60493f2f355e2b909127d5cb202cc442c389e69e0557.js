'use strict';


 // 定义一个集资合约
var CrowdFunding = function () {

    // 出资人地址
    LocalContractStorage.defineMapProperty(this, "addr");
    // 出资总额
    LocalContractStorage.defineMapProperty(this, "famount");
    // 有多少人赞助
    LocalContractStorage.defineProperty(this, "numFunders");


    // 受益人钱包地址
    LocalContractStorage.defineMapProperty(this, "beneficiary");
    // 需要赞助的总额度
    LocalContractStorage.defineMapProperty(this, "fundingGoal");

    // 已赞助的总金额
    LocalContractStorage.defineMapProperty(this, "amount");

    //统计运动员(被赞助人)数量
    LocalContractStorage.defineProperty(this, "numCampaigns");

 };
 
 CrowdFunding.prototype = {
       //  初始化
     init: function () {
         this.numCampaigns = 3;
         this.numFunders = 3;
         //第1个运动员
         this.beneficiary.set(1,"n1Q5XH4bMXGEXEL22cguFsXBM1MkSdBoCJN");
         this.fundingGoal.set(1,3);
         this.amount.set(1,0);
         //第2个运动员
         this.beneficiary.set(2,"n1cGWvRzCvw83stDXBQ2iMDxn7KG5rfZjmo");
         this.fundingGoal.set(2,2);
         this.amount.set(2,0);
         //第3个运动员
         this.beneficiary.set(3,"n1TTDvp8GCHSa7HByqypnf2ghsqveDnrduS");
         this.fundingGoal.set(3,1);
         this.amount.set(3,0);
     },  
    // 新增一个`Campaign`对象，需要传入受益人的地址和需要筹资的总额
     newCampaign: function(beneficiary,fundingGoal){
        this.numCampaigns = this.numCampaigns + 1; 
        this.beneficiary.set(this.numCampaigns,beneficiary);
        this.fundingGoal.set(this.numCampaigns,fundingGoal);
        this.amount.set(this.numCampaigns,0);

     },
     // 通过campaignID给某个Campaign对象赞助
     contribute: function(campaignID){
         // 通过campaignID获取campaignID对应的Campaign对象
         this.addr.set(campaignID,Blockchain.transaction.from);
         this.famount.set(campaignID,Blockchain.transaction.value);
         this.amount.set(campaignID,this.amount.get(campaignID)+Blockchain.transaction.value);
         Blockchain.transfer(this.beneficiary.get(campaignID), Blockchain.transaction.value);
     },
     checkGoalReached: function(campaignID){
        if (this.amount.get(campaignID) < this.fundingGoal.get(campaignID)){
            return false;
        }
        return true;
     },
 };
 module.exports = CrowdFunding;
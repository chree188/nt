"use strict";

var Account = function(text){
	if(text) {
		var o = JSON.parse(text);
		this.name = o.name;		
		this.country = o.country;
		this.province = o.province;
		this.city = o.city;
		this.address = o.address;
		this.phone = o.phone;

		this.cart = o.cart;
		this.shelf = o.shelf;

		this.salingRecord =  o.salingRecord;//未完成的发货订单
		this.saleHistory = o.saleHistory;//已完成的发货订单

		this.orderingRecord = o.orderingRecord;//未完成的收货订单
		this.orderHistory = o.orderHistory;//已完成的收货订单

		this.balance = new BigNumber(o.balance);//用户余额
	} else {
		this.name = "defaultUserName";		
		this.country = "";
		this.province = "";
		this.city = "";
		this.address = "";
		this.phone = "";

		this.cart = "";
		this.shelf = "";//‘[obj1,obj2]’

		this.salingRecord = "";
		this.saleHistory = "";
		this.orderingRecord = "";//[orderInfo1,orderInfo2]
		this.orderHistory = "";

		this.balance = new BigNumber(0);
	}
};

Account.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};

var OrderInfo = function(text){
	if(text){		
		var o = JSON.parse(text);
		this.id = o.id;

		this.saler = o.saler;
		this.buyer = o.buyer;

		this.price = new BigNumber(o.price);
		this.time = JSON.stringify(new Date(o.time));
		this.status = o.status;

		this.good = o.good;
	}else{
		this.id = "";

		this.saler = "";
		this.buyer = "";

		this.price = new BigNumber(0);
		this.time = new Date();
		// 有四种状态："fail" "success" "unsent" "sent"
		this.status = "unsent";

		this.good = "";
	}
};

OrderInfo.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};

var Good = function(text){	
	if(text){
		var o = JSON.parse(text);
		this.id = o.id;
		this.price = new BigNumber(o.price);

		this.name = o.name;
		this.useCondition = o.useCondition;	//几成新
		this.description = o.description;//详细信息
		this.owner = o.owner;//商品的拥有者就是售卖者的地址
		this.status = o.status;
	}else{
		this.id = "";
		this.price = new BigNumber(0);

		this.name = "";
		this.useCondition = "";	//几成新
		this.description = "";
		this.owner = "";		
		this.status = "on";

	}
};

Good.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};

var MarketContract = function(){
	LocalContractStorage.defineMapProperty(this,"userAccounts",{
		parse: function(text){
			return new Account(text);
		},
		stringify:function(o){
			return o.toString();
		}
	});
	LocalContractStorage.defineMapProperty(this,"goodsList",{
		parse:function(text){
			return new Good(text);
		},
		stringify: function(o){
			return o.toString();
		}
	});
	LocalContractStorage.defineProperty(this,"goodsCounter");
	LocalContractStorage.defineProperty(this,"orderCounter");
};

MarketContract.prototype = {
	init: function(){
		this.goodsCounter = 0;
		this.orderCounter = 0;
	},

	register: function(name,phone,country,province,city,address){
		var from = Blockchain.transaction.from;

		if(this.userAccounts.get(from)){
			return "注册失败，您已注册过账户，请直接登录。";
		}
		if(name==""||phone==""||country==""||province==""||city==""||address=="")
			return "注册失败，请填写完整注册信息。";
		var user = new Account();
		user.name = name;
		user.phone = phone;
		user.country = country;
		user.province = province;
		user.city = city;
		user.address = address;
		this.userAccounts.put(from,user);
		return "注册成功！";
	},


	login: function(){
		var from = Blockchain.transaction.from;

		if(!this.userAccounts.get(from)){
			return "抱歉，您尚未注册账户。";
		}

		var user = this.userAccounts.get(from);
		return user; //登录成功
	},

	modifyUserInfo: function(property,value){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);

		switch(property){
			case "name":
				user.name = value;
				break;
			case "country":
				user.country = value;
				break;
			case "province":
				user.province = value;
				break;
			case "city":
				user.city = value;
				break;
			case "address":
				user.city = value;
				break;
			case "phone":
				user.phone = value;
				breaek;
			default:
				return "抱歉，该属性不存在。";
		}
		this.userAccounts.put(from,user);
		return "修改成功，恭喜用户"+user.name;
	},

	// 返回所有在售商品列表对象
	displayAllGoods: function(){
		var allGoodsList = new Array();
		var tmpGood;

		for(var i=0; i < this.goodsCounter; i++){
			tmpGood = this.goodsList.get(i.toString());
			tmpGood = new Good(tmpGood);
			if(tmpGood.status == "on")
				allGoodsList.unshift(tmpGood);	
		}
		return allGoodsList.join("#");
	},

	//加入售卖商品，商品信息添加进去
	addToShelf: function(name,price,useCondition,description){
		if(name==""||useCondition==""||description=="")
			return -1;//"商品信息不完整，请重新输入。"
		var priceNumber = new BigNumber(price);
		if(!priceNumber.gt(0))
			return -2;//"商品价格不合理，请重新输入。"

		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);

		var myGood = new Good();
		myGood.id = this.goodsCounter++;
		myGood.name = name;
		myGood.price = priceNumber;

		myGood.useCondition = useCondition;
		myGood.description = description;

		myGood.owner = from;
		myGood.status = "on";

		//将该商品，加入商品列表，和用户的货架上
		this.goodsList.put(myGood.id,myGood);	

		var shelf;
		if(user.shelf==""){
			shelf = [];
		}else{
			shelf = user.shelf.split("#");
		}
		//[obj1,obj2]
		shelf.unshift(myGood);//[]
		user.shelf = shelf.join("#");//obj1,obj2,...
		this.userAccounts.put(from,user);

		return user;
	},

	//加入购物车
	addToCart: function(goodId){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);

		var goodToBuy = this.goodsList.get(parseInt(goodId));
		if(!goodToBuy)
			return "抱歉，该商品不存在。";
		if(goodToBuy.status == "off")
			return -1;//"抱歉，该商品已下架。";

		var cart;
		if(user.cart == ""){
			cart = [];
		}else{
			cart = user.cart.split("#");
		}
		cart.unshift(goodToBuy);
		user.cart = cart.join("#");
		this.userAccounts.put(from,user);

		return user.cart.toString();
	},

	// 从购物车中删除
	removeFromCart: function(goodId){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);

		var goodToRemove = this.goodsList.get(parseInt(goodId));
		if(!goodToRemove)
			return "抱歉，该商品不存在。";

		var cart;
		if(user.cart == ""){
			cart = [];
		}else{
			cart = user.cart.split("#");
		}
		for(var i=0; i < cart.length; i++){	//遍历数组
			var tmp = new Good(cart[i]);
			if(tmp.id == goodToRemove.id){	//找到数组中符合该商品的对象
				cart.splice(i,1);	// 从购物车数组cart中删除该商品
				break;
			}
		}
		user.cart = cart.join("#");
		this.userAccounts.put(from,user);

		return 0;
	},

	removeFromShelf: function(goodId){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);

		var goodToRemove = this.goodsList.get(parseInt(goodId));
		if(!goodToRemove)
			return "抱歉，该商品不存在。";

		var shelf;
		if(user.shelf == ""){
			shelf = [];
		}else{
			shelf = user.shelf.split("#");
		}
		
		for(var i=0; i < shelf.length; i++){	//遍历数组
			var tmp = new Good(shelf[i]);
			if(tmp.id == goodToRemove.id){	//找到数组中符合该商品的对象
				shelf.splice(i,1);	// 从购物车数组cart中删除该商品
				break;
			}
		}
		user.shelf = shelf.join("#");
		this.userAccounts.put(from,user);

		// 设置该商品为 off 状态
		var good = this.goodsList.get(goodId);
		good.status = "off";
		this.goodsList.put(goodId,good);

		return 0;
	},
	// =======================================test：3

	// 买家下订单,并支付
	orderBuy: function(goodId){
		var goodToBuy = this.goodsList.get(parseInt(goodId));//根据goodId得到商品对象goodToBuy

		if(!goodToBuy)
			return -4;// "抱歉，该商品不存在。"
		// 检查商品的状态，查看是否可以购买
		if(goodToBuy.status == "off")
			return -2;//"抱歉，该商品已下架。";
		if(goodToBuy.status == "ing")
			return -3;//"抱歉，商品正在交易中。不过，如果交易失败，还有机会哦"；

		var from = Blockchain.transaction.from;//获取购买者的钱包地址
		var user = this.userAccounts.get(from);//得到购买者的对象
		var saler;//得到该商品的出售者的对象

		// 检查余额,balance单位是人民币
		if(goodToBuy.price.gt(user.balance)){
			return -1;//"抱歉，您的余额不足，请充值。"
		}

		//修改商品出售状态
		goodToBuy.status = "ing";
		this.goodsList.put(goodToBuy.id,goodToBuy);//将修改后的商品信息保存到链中

		//购买者进行支付
		user.balance = user.balance.sub(goodToBuy.price);

		//生成订单,并加入订单列表,此时订单状态为 未完成（意味着钱款在合约这里）
		var order = new OrderInfo();//新建一个订单，构造函数会自动填补：价格、时间、状态
		order.id = this.orderCounter++;//订单id为订单数，orderCounter（订单数）自增
		order.saler = goodToBuy.owner;//订单出售者 为 商品拥有者的钱包地址
		order.buyer = from;//订单购买者 为 该用户的钱包地址
		order.good = goodToBuy.toString();//订单商品是该商品信息的JSON字符串
		order.price = goodToBuy.price;//订单价格为商品的价格（都是BigNumber类型）

		//将订单加入到 买家的“未完成的购买订单”中
		var orderingRecord;
		if(user.orderingRecord==""){
			orderingRecord = [];
		}else{
			orderingRecord = user.orderingRecord.split("#");//获取未完成购买订单记录的数组
		}
		orderingRecord.push(order);//将该订单，加入数组
		user.orderingRecord = orderingRecord.join("#");//更新购买者的信息
		
		//购物车中删除该商品
		var cart;
		if(user.cart == ""){
			cart = [];
		}else{
			cart = user.cart.split("#");
		}
		for(var i=0; i < cart.length; i++){	//遍历数组
			var tmp = new Good(cart[i]);
			if(tmp.id == goodToBuy.id){	//找到数组中符合该商品的对象
				cart.splice(i,1);	// 从购物车数组cart中删除该商品
				break;
			}
		}
		user.cart = cart.join("#");	//将购物车数组cart写回购买者中
		// user.cart = "";
		this.userAccounts.put(from,user);	//将购买者信息写到区块链中		

		saler = this.userAccounts.get(goodToBuy.owner);
		// 将订单加入到 卖家的“未完成的出售订单”中
		var salingRecord;
		if(saler.salingRecord == ""){
			salingRecord = [];
		}else{
			salingRecord = saler.salingRecord.split("#");
		}
		salingRecord.push(order);	//将订单信息加入
		saler.salingRecord = salingRecord.join("#");	//更新出售者的订单信息
		this.userAccounts.put(goodToBuy.owner,saler);	//将出售者写入区块链

		return "user:"+user;//order
	},

	// ===================================test:4
	//卖家确认发货,更改订单状态为“已发货”
	orderSendout: function(orderId){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);
		var buyer;
		var buyerId;
		// 更新卖家的订单信息
		var salingRecord;
		if(user.salingRecord==""){
			salingRecord=[];
		}else{
			salingRecord = user.salingRecord.split("#");
		}
		for(var i=0; i < salingRecord.length; i++){
			var tmp = new OrderInfo(salingRecord[i]);
			if(tmp.id == parseInt(orderId)){
				buyerId = tmp.buyer;
				tmp.status = "sent";
				salingRecord[i] = tmp.toString();
				break;
			}
		}
		user.salingRecord = salingRecord.join("#");
		this.userAccounts.put(from,user);

		// 更新买家的订单信息
		buyer = this.userAccounts.get(buyerId);
		var orderingRecord;
		if(buyer.orderingRecord==""){
			orderingRecord = [];
		}else{
			orderingRecord = buyer.orderingRecord.split("#");
		}
		
		for(var i=0; i < orderingRecord.length; i++){
			var tmp = new OrderInfo(orderingRecord[i]);
			if(tmp.id == parseInt(orderId)){
				tmp.status = "sent";
				orderingRecord[i] = tmp.toString();
				break;
			}
		}
		buyer.orderingRecord = orderingRecord.join("#");
		this.userAccounts.put(buyerId,buyer);

		return "salingRecord:"+salingRecord.toString();
	},

	// ================================test:5
	//买家确认收货，将钱款转给卖家
	orderReceive: function(orderId){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);
		var saler;
		var order;

		var orderingRecord;
		//查找到买家的未完成订单
		if(user.orderingRecord == ""){
			orderingRecord = [];
		}else{
			orderingRecord = user.orderingRecord.split("#");
		}
		for(var i=0; i<orderingRecord.length;i++){
			order = JSON.parse(orderingRecord[i]);
			if(order.id == parseInt(orderId)){
				order = new OrderInfo(orderingRecord[i]);
				order.status="success";
				orderingRecord.splice(i,1);
				break;
			}
		}
		//更新买家的未完成订单、历史订单信息
		user.orderingRecord = orderingRecord.join("#");

		var orderHistory;
		if(user.orderHistory == ""){
			orderHistory = [];
		}else{
			orderHistory = user.orderHistory.split("#");
		}
		orderHistory.unshift(order);
		user.orderHistory = orderHistory.join("#");
		this.userAccounts.put(from,user);

		saler = this.userAccounts.get(order.saler);
		//将钱款转给卖家
		saler.balance = saler.balance.plus(order.price);
		//删除卖家的未完成售卖订单

		var salingRecord;
		if(saler.salingRecord == ""){
			salingRecord = [];
		}else{
			salingRecord = saler.salingRecord.split("#");
		}
		for(var i=0; i<salingRecord.length; i++){
			if(JSON.parse(salingRecord[i]).id==parseInt(orderId)){
				salingRecord.splice(i,1);
				break;
			}
		}
		saler.salingRecord = salingRecord.join("#");

		//加入卖家的已完成售卖订单
		var saleHistory;
		if(saler.saleHistory==""){
			saleHistory = [];
		}else{
			saleHistory = saler.saleHistory.split("#");
		}
		saleHistory.unshift(order);
		saler.saleHistory = saleHistory.join("#");

		// 从卖家的货架中删除该商品
		var goodId = new Good(order.good).id;

		var shelf;
		if(saler.shelf==""){
			shelf = [];
		}else{
			shelf = saler.shelf.split("#");
		}
		for(var i=0; i< shelf.length; i++){
			var tmp = new Good(shelf[i]);
			if(tmp.id == goodId){
				shelf.splice(i,1);
				break;
			}
		}
		saler.shelf = shelf.join("#");

		this.userAccounts.put(order.saler,saler);

		// 设置该商品为 off 状态
		var good = this.goodsList.get(goodId);
		good.status = "off";
		this.goodsList.put(goodId,good);

		return 0;
	},

	//买家取消订单：检查是否为买家、检查是否已经发货、退款给买家
	buyerOrderCancel: function(orderId){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);
		var saler,order;

		//查找到买家的未完成订单,检查是否可以取消订单，更新订单信息
		var orderingRecord;
		if(user.orderingRecord == ""){
			orderingRecord = [];
		}else{
			orderingRecord = user.orderingRecord.split("#");
		}
		for(var i=0; i<orderingRecord.length;i++){
			if(JSON.parse(orderingRecord[i]).id == parseInt(orderId)){
				order = new OrderInfo(orderingRecord[i]);
				if(order.buyer != from)
					return -1;//抱歉，不是买家，没有这个权限。
				if(order.status == "sent")
					return -2;//抱歉，您的订单已经发货，买家无法取消订单。请联系卖家
				order.status="buyerFail";
				orderingRecord.splice(i,1);
				break;
			}
		}
		user.orderingRecord = orderingRecord.join("#");

		var orderHistory;
		if(user.orderHistory == ""){
			orderHistory = [];
		}else{
			orderHistory = user.orderHistory.split("#");
		}
		orderHistory.unshift(order);
		user.orderHistory = orderHistory.join("#");

		user.balance = user.balance.plus(order.price);
		this.userAccounts.put(from,user);

		//订单信息更新
		saler = this.userAccounts.get(order.saler);
		//删除卖家的未完成售卖订单
		var salingRecord;
		if(saler.salingRecord == ""){
			salingRecord = [];
		}else{
			salingRecord = saler.salingRecord.split("#");
		}
		for(var i=0; i<salingRecord.length; i++){
			if(JSON.parse(salingRecord[i]).id == parseInt(orderId)){
				salingRecord.splice(i,1);
				break;
			}
		}
		saler.salingRecord = salingRecord.join("#");
		//加入卖家的已完成售卖订单
		var saleHistory;
		if(saler.saleHistory==""){
			saleHistory = [];
		}else{
			saleHistory = saler.saleHistory.split("#");
		}
		saleHistory.unshift(order);
		saler.saleHistory = saleHistory.join("#");

		this.userAccounts.put(order.saler,saler);

		// 恢复商品状态为 on
		var goodId = new Good(order.good).id;
		var good = this.goodsList.get(goodId);
		good.status = "on";
		this.goodsList.put(goodId,good);

		return 0;
	},

	//卖家取消订单:检查是否为卖家、退款给买家
	salerOrderCancel: function(orderId){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);
		var buyer,order;

		//查找到卖家的未完成订单,检查是否可以取消订单，更新订单信息
		var salingRecord;
		if(user.salingRecord == ""){
			salingRecord = [];
		}else{
			salingRecord = user.salingRecord.split("#");
		}
		for(var i=0; i<salingRecord.length;i++){
			if(JSON.parse(salingRecord[i]).id == parseInt(orderId)){
				order = new OrderInfo(salingRecord[i]);
				if(order.saler != from)
					return -1;//抱歉，不是卖家，没有这个权限。	
				order.status="salerFail";
				salingRecord.splice(i,1);
				break;
			}
		}
		user.salingRecord = salingRecord.join("#");

		var saleHistory;
		if(user.saleHistory==""){
			saleHistory = [];
		}else{
			saleHistory = user.saleHistory.split("#");
		}
		saleHistory.unshift(order);
		user.saleHistory = saleHistory.join("#");
		this.userAccounts.put(from,user);
		
		buyer = this.userAccounts.get(order.buyer);
		buyer.balance = buyer.balance.plus(order.price);		
		//更新买家的未完成售卖订单
		var orderingRecord;
		if(buyer.orderingRecord == ""){
			orderingRecord = [];
		}else{
			orderingRecord = buyer.orderingRecord.split("#");
		}
		for(var i=0; i<orderingRecord.length;i++){
			if(JSON.parse(orderingRecord[i]).id == parseInt(orderId)){
				orderingRecord.splice(i,1);
				break;
			}
		}
		buyer.orderingRecord = orderingRecord.join("#");

		var orderHistory;
		if(buyer.orderHistory == ""){
			orderHistory = [];
		}else{
			orderHistory = buyer.orderHistory.split("#");
		}
		orderHistory.unshift(order);
		buyer.orderHistory = orderHistory.join("#");
		this.userAccounts.put(order.buyer,buyer);

		// 恢复商品状态为 on
		var goodId = new Good(order.good).id;
		var good = this.goodsList.get(goodId);
		good.status = "on";
		this.goodsList.put(goodId,good);

		return 0;
	},

	//用户充值
	topUpBalance: function(){
		var from = Blockchain.transaction.from;
		var nasValue = Blockchain.transaction.value;
		var rmbValue = new BigNumber(this.nasToRmb(nasValue));

		var user = this.userAccounts.get(from);
		// 如果账户为空，则报错
		if(!user){
			return "抱歉，您尚未注册账户。"
		}

		user.balance = user.balance.plus(rmbValue);
		this.userAccounts.put(from,user);
		return 0;
	},

	//用户提现
	withdrawBalance: function(amountArgu){
		var from = Blockchain.transaction.from;
		var nasValue = Blockchain.transaction.value;

		var amount = new BigNumber(amountArgu);
		var nasAmount = new BigNumber(this.rmbToNas(amountArgu));
		var value = new BigNumber(this.nasToRmb(nasValue));

		var user = this.userAccounts.get(from);
		if (!user){
			throw new Error("用户未注册。");
		}
		if (amount.gt(user.balance)){
			throw new Error("余额不足。");
		}
		user.balance = user.balance.sub(amount);

		if(value==0){
			this.userAccounts.put(from, user);
            var result = Blockchain.transfer(from, nasAmount);
        }else {
            user.balance = user.balance.plus(value);
            this.userAccounts.put(from, user);
            var result = Blockchain.transfer(from, nasAmount);
        }
	},

	// x个nas返回，兑换的RMB的值
	nasToRmb: function(nasNum){
		var nas = new BigNumber(nasNum);
		var rmb = nas.times(70);
		return rmb;
	},

	rmbToNas: function(rmbNum){
		var rmb = new BigNumber(rmbNum);
		var nas = rmb.dividedBy(70);
		return nas;
	},

	getCart: function(){
		var from = Blockchain.transaction.from;

		if(!this.userAccounts.get(from)){
			return -1;
		}

		var user = this.userAccounts.get(from);
		return user.cart; 
	},

	getShelf: function(){
		var from = Blockchain.transaction.from;

		if(!this.userAccounts.get(from)){
			return -1;
		}

		var user = this.userAccounts.get(from);
		return user.shelf; 
	},

	getSalingRecord: function(){
		var from = Blockchain.transaction.from;

		if(!this.userAccounts.get(from)){
			return -1;
		}

		var user = this.userAccounts.get(from);
		return user.salingRecord; 
	},

	getSaleHistory: function(){
		var from = Blockchain.transaction.from;

		if(!this.userAccounts.get(from)){
			return -1;
		}

		var user = this.userAccounts.get(from);
		return user.saleHistory; 
	},

	getOrderingRecord: function(){
		var from = Blockchain.transaction.from;

		if(!this.userAccounts.get(from)){
			return -1;
		}

		var user = this.userAccounts.get(from);
		return user.orderingRecord; 
	},

	getOrderHistory: function(){
		var from = Blockchain.transaction.from;

		if(!this.userAccounts.get(from)){
			return -1;
		}

		var user = this.userAccounts.get(from);
		return user.orderHistory; 
	},

		deleteSaleHistory: function(orderId){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);

		var saleHistory;
		if(user.saleHistory==""){
			saleHistory = [];
		}else{
			saleHistory = user.saleHistory.split("#");
		}
		for(var i = 0; i < saleHistory.length; i++){
			if((saleHistory[i][0]!="{")||(JSON.parse(saleHistory[i]).id==parseInt(orderId))){
				saleHistory.splice(i,1);
				break;
			}
		}
		user.saleHistory = saleHistory.join("#");
		this.userAccounts.put(from,user);
	},

	deleteOrderHistory: function(orderId){
		var from = Blockchain.transaction.from;
		var user = this.userAccounts.get(from);

		var orderHistory;
		if(user.orderHistory==""){
			orderHistory = [];
		}else{
			orderHistory = user.orderHistory.split("#");
		}
		for(var i = 0; i < orderHistory.length; i++){
			if((orderHistory[i][0]!="{")||(JSON.parse(orderHistory[i]).id==parseInt(orderId))){
				orderHistory.splice(i,1);
				break;
			}
		}
		user.orderHistory = orderHistory.join("#");
		this.userAccounts.put(from,user);
	}
};

module.exports = MarketContract;
"use strict";

var userItem = function(text){
	if(text){
		var obj		=	JSON.parse(text);
		this.daming	=	obj.daming;
		this.score	=	obj.score;
		
	}else{
		return "empty useritem";
	}
};

userItem.prototype	=	{
};


var UserContract = function () {
  LocalContractStorage.defineMapProperty(this, "repo", null);
};


function mergeSort(arr, key, order) {
        if (!isArray(arr)) return [];
        var key = isArray(key) ? key : [];
        // 对数组arr做若干次合并：数组arr的总长度为len，将它分为若干个长度为gap的子数组；
        // 将"每2个相邻的子数组" 进行合并排序。
        // len = 数组的长度，gap = 子数组的长度
        function mergeGroups(arr, len, gap) {
            // 对arr[0..len)做一趟归并排序
            // 将"每2个相邻的子数组"进行合并排序
            for (var i = 0; i + 2 * gap - 1 < len; i += gap * 2) {
                merge(arr, i, i + gap - 1, i + 2 * gap - 1);  // 归并长度为len的两个相邻子数组
            }
            // 注意：
            // 若i ≤ len - 1且i + gap - 1 ≥ len - 1时，则剩余一个子数组轮空，无须归并
            // 若i + gap - 1 < len - 1，则剩余一个子数组没有配对
            // 将该子数组合并到已排序的数组中
            if (i + gap - 1 < len - 1) {                              // 尚有两个子文件，其中后一个长度小于len - 1
                merge(arr, i, i + gap - 1, len - 1);           // 归并最后两个子数组
            }        
        }
        // 核心排序过程
        function merge(arr, start, mid, end) {
            var i = start;      // 第1个有序区的索引，遍历区间是：arr数组中的[start..mid]
            var j = mid + 1;    // 第2个有序区的索引，遍历区间是：arr数组中的[mid + 1..end]
            var aTmp  = [];     // 汇总2个有序区临时数组
            var kTmp  = [];
            var isAsc = (order + '').toLowerCase() !== 'desc';
            /* 排序过程开始 */
            while (i <= mid && j <= end) {   // 遍历2个有序区，当该while循环终止时，2个有序区必然有1个已经遍历并排序完毕
                if ((!isAsc && arr[i] <= arr[j]) || (isAsc && arr[i] >= arr[j])) {  // 并逐个从2个有序区分别取1个数进行比较，将较小的数存到临时数组aTmp中
                    aTmp.push(arr[i]);
                    kTmp.push(key[i++]);
                } else {
                    aTmp.push(arr[j]);
                    kTmp.push(key[j++]);
                }
            }
            // 将剩余有序区的剩余元素添加到临时数组aTmp中
            while (i <= mid) {
                aTmp.push(arr[i]);
                kTmp.push(key[i++]);
            }
            while (j <= end) {
                aTmp.push(arr[j]);
                kTmp.push(key[j++]);
            }
　　　　　　  /*排序过程结束*/
            var len = aTmp.length, k;
            // 此时，aTmp数组是经过排序后的有序数列，然后将其重新整合到数组arr中
            for (k = 0; k < len; k++) {  
                arr[start + k] = aTmp[k];
                key[start + k] = kTmp[k];
            }
        }
        // 归并排序(从下往上)
        return (function (arr) {
            // 采用自底向上的方法，对arr[0..len)进行二路归并排序
            var len = arr.length;
            if (len <= 0) return arr;
            for (var i = 1; i < len; i *= 2) {   // 共log2(len - 1)趟归并
                mergeGroups(arr, len, i);        // 有序段长度 ≥ len时终止
            }
        })(arr);
    }

	function arrayKeys(arr) {
        var i    = 0, 
            len  = arr.length,
            keys = [];
        while (i < len) {
            keys.push(i++);
        }
        return keys;
    }　
	
    // 数组原型链方法
    Array.prototype.mergeSort = function (key, order) {
        var key = ({}).toString.call(key) == '[object Array]' ? key : [];
        function mergeGroups(arr, len, gap) {
            for (var i = 0; i + 2 * gap - 1 < len; i += gap * 2) {
                merge(arr, i, i + gap - 1, i + 2 * gap - 1);
            }
            if (i + gap - 1 < len - 1) {
                merge(arr, i, i + gap - 1, len - 1);
            }        
        }
        // 核心排序过程
        function merge(arr, start, mid, end) {
            var i = start; 
            var j = mid + 1;
            var aTmp = [];
            var kTmp = [];
            var isAsc = (order + '').toLowerCase() !== 'desc';
            /* 排序过程开始 */
            while (i <= mid && j <= end) { 
                if ((isAsc && arr[i] <= arr[j]) || (!isAsc && arr[i] >= arr[j])) {
                    aTmp.push(arr[i]);
                    kTmp.push(key[i++]);
                } else {
                    aTmp.push(arr[j]);
                    kTmp.push(key[j++]);
                }
            }
            while (i <= mid) {
                aTmp.push(arr[i]);
                kTmp.push(key[i++]);
            }
            while (j <= end) {
                aTmp.push(arr[j]);
                kTmp.push(key[j++]);
            }
　　　　　　　/*排序过程结束*/
            var len = aTmp.length, k;
            for (k = 0; k < len; k++) {  
                arr[start + k] = aTmp[k];
                key[start + k] = kTmp[k];
            }
        }
        // 归并排序(从下往上)
        return (function (arr) {
            var len = arr.length;
            if (len <= 0) return arr;
            for (var i = 1; i < len; i *= 2) {
                mergeGroups(arr, len, i);
            }
            return arr;
        })(this);
    };

UserContract.prototype = {
	init:function(){
		
	},
	
	getAllStr:function(){//返回所有内容
		var tem = new Array();
		tem = LocalContractStorage.get('up');
		
		var strarr = new Array();
		strarr = LocalContractStorage.get('detail');
		
		//显示的时候，先排序
		var kk = arrayKeys(tem);
		tem.mergeSort(kk,'desc');//kk变为原索引
		//heapSort(tem,kk,'desc');
		var str = '';
		var yiluru;
		
		for(var i= 0;i < kk.length;i++ ){
			if(tem[i] > 0){
				str +=  "<li>"+ strarr[kk[i]] + "<span class='hzs'>获赞数：<b>"+tem[i]+"</b></span><button theid='" + kk[i] + "'>为他点赞</button></li>";
				delete(tem[i]);
			}
			
		}
		
		for(var j = strarr.length; j>=0 ; j--){
			if(tem[j] != undefined){
				str +=  "<li>"+ strarr[j] + "<span class='hzs'>获赞数：<b>"+tem[j]+"</b></span><button theid='" + j + "'>为他点赞</button></li>";
			}
		}
		
		return str;
	},
	
	setUp:function(num){//点赞  num
		var tem = new Array();
		tem = LocalContractStorage.get('up');
		if(tem.length > num && num >= 0){
			tem[num*1] = tem[num*1] *1 + 1;
			LocalContractStorage.set('up' ,tem);
			return '点赞成功';
		}else{
			return '点赞的留言不存在';
		}
	},
	
		
	save: function(liuyan){

		
		if(liuyan.length >200 || liuyan.leng <=1 ){
			return "输入字数必须大于1且小于200";
		}
	
		var d = new Date();
		var tem = new Array();
		var tem2 = new Array();
		var from1 = Blockchain.transaction.from;
		
		if(LocalContractStorage.get('detail')){//存储详细信息，存储的是json 类型，  key为当前数组个数，value为评论内容，日期，等
			
			tem = LocalContractStorage.get('detail');	
			tem2 = LocalContractStorage.get('up');//存储点赞数，存储的是json类型，key为当前数组个数，value为点赞个数
					
		}
		
		tem.push("<div class='neirong'>"+ liuyan +"</div><span>发布时间："+d.toString()+"</span><span>钱包地址："+from1+"</span>");			
		LocalContractStorage.set('detail',tem);
		
		tem2.push(0);
		LocalContractStorage.set('up',tem2);
		
	},
};

module.exports = UserContract

"use strict";



var wordContract = function () {

    //TODO
};



wordContract.prototype = {

    init: function () {
        //TODO
    },
    get: function (key) {
        if (key === "") {
            throw new Error("empty key");
        }
        var value = LocalContractStorage.get(key);
        return value;

    },

    search: function (key) {
        if (key !== "") {
            var resp = LocalContractStorage.get('danci')
            var dancice = resp;
            for (var i = 0; i < dancice.length; i++) {
                if (dancice[i]['dc'] == key) {
                    return dancice[i]['fy'];
                }
            }
            return '您搜索的单词，未记载在词库，你要添加嘛？';

        } else {
            return '你要查询的话，请输入你的单词呀';
        }
    },

    bijiao: function (nub, fy) {
        if (!fy) {
            return '请输入翻译后再提交!'
        } else {
            var resp = LocalContractStorage.get('danci');
            var dancice = resp;
            var jiaodui = LocalContractStorage.get('jiaodui') || [];
            if (fy == dancice[nub]['fy']) {
                if (jiaodui.length == 0) {
                    jiaodui.push({
                        'dc': dancice[nub]['dc'],
                        'nub': 1
                    })
                } else {
                    for (var i = 0; i < jiaodui.length; i++) {
                        if (jiaodui[i]['dc'] == dancice[nub]['dc']) {
                            jiaodui[i]['nub'] = jiaodui[i]['nub'] + 1;
                            if (jiaodui[i]['nub'] >= 3) {
                                for (var j = 0; j < dancice.length; j++) {
                                    if (dancice[j]['dc'] == jiaodui[i]['dc']) {
                                        dancice.splice(j, 1);
                                        jiaodui.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                var ret={
                    'danci':dancice,
                    'jiaodui':jiaodui
                }
                return JSON.stringify(ret)
            } else {
                return "错误";
            }
        }
    },

    save: function (fanyi, danci) {
        if (fanyi && danci) {
            if (!LocalContractStorage.get('danci')) {
                LocalContractStorage.set('danci', []);
            }
            var datas=LocalContractStorage.get('danci');;
            var k = 0;
            for (var i = 0; i < datas.length; i++) {
                if (danci == datas[i]['dc']) {
                    datas[i]['fy'] = fanyi;
                    k = 1;
                }
            }
            if (!k) {
                datas.push({
                    'dc': danci,
                    'fy': fanyi
                });
            }
            LocalContractStorage.set('danci', datas);
        } else {
            return '请输入单词和翻译!';
        }
    },
    saves: function(danci,jiaodui){
        danci=decodeURI(danci);
        jiaodui=decodeURI(jiaodui);
        danci=JSON.parse(danci);
        jiaodui=JSON.parse(jiaodui);
        LocalContractStorage.set('danci',danci);
        LocalContractStorage.set('jiaodui',jiaodui);
    }
};

module.exports = wordContract;
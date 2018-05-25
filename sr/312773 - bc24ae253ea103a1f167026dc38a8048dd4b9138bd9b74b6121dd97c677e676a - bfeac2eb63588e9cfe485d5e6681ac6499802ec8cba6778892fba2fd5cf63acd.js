"use strict";

var N = (function N() {

    var Util = {
        extend: function extend (object) {
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0, source; source = args[i]; i++) {
                if (!source) continue;
                for (var property in source) {
                    object[property] = source[property];
                }
            }
            return object;
        },
        now: function () {
            return Blockchain.transaction.timestamp * 1000;
        },
        isString: function(text){
            return typeof text === 'string';
        }
    };

    function Response(options) {
        var o = (options)?options:{
            status: 200,
            message: '',
            data: ''
        };
        Util.extend(this, o);
    }
    Response.prototype.toString = function () {
        return JSON.stringify(this);
    };

    function Request(options) {
        var o = (options)?{params:JSON.parse(options)}:{
            // method: '',
            params: ''
        };
        Util.extend(this, o);
    }


    function Model(options) {

        function Model(text) {
            var o = text ?
            ( Util.isString(text) ? JSON.parse(text): text ) : options.data;
            Util.extend(this, o);
        }

        Model.prototype.toString = function () {
            return JSON.stringify(this);
        };

        return Model;
    }

    function ModelArray(options) {


        var modelsName = options.name;
        var idKey = options.name+'_id';
        var lengthKey = options.name+'_length';

        // function getLengthKey(modelsName) {
        //     return modelsName+'_length';
        // }

        function getModels() {
            return this[modelsName];
        }

        function ModelArray() {

            // var o = text ?
            //     ( Util.isString(text) ? JSON.parse(text): text ) : {models:[]};
            // Util.extend(this, o);
            // this.models = [];

            // LocalContractStorage.defineMapProperty(contract, 'records', {
            //     parse: function (text) {
            //         return new options.model(text);
            //     },
            //     stringify: function (o) {
            //         return o.toString();
            //     }
            // });
            //
            // LocalContractStorage.defineProperties(this, {
            //     length: 0
            // });

            // this.contract = contract;


        }

        ModelArray.define = function () {
            LocalContractStorage.defineMapProperty(this, modelsName, {
                parse: function (text) {
                    return new options.model(text);
                },
                stringify: function (o) {
                    return o.toString();
                }
            });

            // var lengthKey = getLengthKey(modelsName);
            var params = {};
            params[lengthKey] = 0;
            params[idKey] = 1;
            LocalContractStorage.defineProperties(this, params);
        };

        // ModelArray.prototype.toString = function () {
        //     return JSON.stringify(this);
        // };

        ModelArray.init = function () {
            // var
            // this.defineMapProperty('records', records);
            // this[lengthKey] = 0;
            // var lengthKey = getLengthKey(modelsName);
            this[lengthKey] = 0;
        };




        ModelArray.push = function (model) {
            // var index = this.length;
            // var array = this[options.name];
            // array.put(index, model);
            // this.contract.records.put(index, model);
            // this.length = this.length + 1;
            // this.models.push(model);
            // var lengthKey = getLengthKey(modelsName);
            var index = this[lengthKey];
            var models = getModels.call(this);
            models.put(index, model);
            this[lengthKey] = index + 1;
        };

        ModelArray.put = function (model) {
            // var index = this.length;
            // var array = this[options.name];
            // array.put(index, model);
            // this.contract.records.put(index, model);
            // this.length = this.length + 1;
            // this.models.push(model);
            // var lengthKey = getLengthKey(modelsName);
            // var index = this[lengthKey];
            // var models = getModels.call(this);
            // models.put(index, model);
            // this[lengthKey] = index + 1;

            var models = getModels.call(this);
            models.put(model.id, model);
        };

        ModelArray.get = function (index) {
            // var array = this[options.name];
            // return array.get(index);
            // return this.contract.records.get(index);
            // return this.models[index];
            // return this[options.name].get(index);
            var models = getModels.call(this);
            return models.get(index);
        };

        ModelArray.size = function () {
            // var lengthKey = getLengthKey(modelsName);
            return parseInt(this[lengthKey]);
        };

        ModelArray.isEmpty = function () {
            // return this.size() === 0;
            return ModelArray.size.call(this) === 0;
        };

        ModelArray.toArray = function () {
            var list = [];
            var len = ModelArray.size.call(this);
            for(var i=0;i<len;i++){
                list.push( ModelArray.get.call(this, i) );
            }
            return list;
        };

        return ModelArray;
    }

    function Contract(options) {

        var self = this;

        function Contract() {
            if(options.create){
                options.create.call(self);
            }
        }

        if(options.methods){
            // Contract.prototype = options.methods;
            // Contract.prototype.custom_method = function (text) {
            //
            //
            //
            //
            //
            // };

            Object.keys(options.methods).forEach(function (method) {

                /*
                * request
                *
                * headers
                *
                * params
                *
                * */
                Contract.prototype[method] = function (text) {

                    var fun = options.methods[method];

                    var request = new Request(text);
                    var response = new Response();

                    fun.call(self, request, response);

                    return response;
                };

            });

        }

        if(options.init){
            Contract.prototype.init = function () {
                return options.init.call(self);
            };
        }

        /*Contract.prototype.defineMapProperty = function (name, collection) {

            LocalContractStorage.defineMapProperty(this, name, {
                parse: function (text) {
                    return new collection.model(text);
                },
                stringify: function (o) {
                    return o.toString();
                }
            });

        };

        Contract.prototype.defineProperties = function (model) {
            LocalContractStorage.defineProperties(this, model);
        };*/

        return Contract;
    }

    return {
        Util: Util,
        Response: Response,
        Request: Request,
        Contract: Contract,

        Model: Model,
        ModelArray: ModelArray,


    }

})();

var Record = N.Model({
    data:{
        id: '',
        loveNum: 0,
        name: '',
        img: '',
        timestamp: 0
    },
    methods:{

    }
});

var RecordList = N.ModelArray({
    name: 'records',
    model: Record
});

var LoveContract = N.Contract({
    create(){
        RecordList.define.call(this);
    },
    init(){
        RecordList.init.call(this);
    },
    methods:{
        createRecord: function(request, response) {

            var index = RecordList.size.call(this);

            var record = new Record(request.params);
            record.id = index;
            // record.id = 'id99999';
            // record.name = 'my name';
            record.loveNum = 0;
            record.timestamp = N.Util.now();

            RecordList.push.call(this, record);

            response.data = record;
            response.message = RecordList.size.call(this);
        },

        getRecords: function (request, response) {
            response.data = RecordList.toArray.call(this);
        },

        getRecord: function (request, response) {
            var id = request.params.id;
            response.data = RecordList.get.call(this, id);
        },

        love: function (request, response) {
            var id = request.params.id;
            var record = RecordList.get.call(this, id);
            record.loveNum = record.loveNum + 1;
            RecordList.put.call(this, record);
            response.data = record;
        }
    }
});

module.exports = LoveContract;

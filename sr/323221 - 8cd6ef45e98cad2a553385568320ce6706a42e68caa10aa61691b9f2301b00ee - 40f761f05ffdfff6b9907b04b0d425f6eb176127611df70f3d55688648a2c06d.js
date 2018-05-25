'use strict'

var StudentEnrollmentItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.sex = obj.sex;
        this.id_number = obj.id_number;
		this.school_name = obj.school_name;
        this.level = obj.level;
        this.major = obj.major;
		this.status = obj.status;
		this.diploma_number = obj.diploma_number;
    }
};

StudentEnrollmentItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var StudentEnrollment = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new StudentEnrollmentItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineProperty(this, "size");
	LocalContractStorage.defineMapProperty(this, "arrayMap");
};

StudentEnrollment.prototype ={
    init:function(){
         this.size = 0;
    },

    save:function(name,sex,id_number,school_name,level,major,status,diploma_number){
        if(!name || !sex || !id_number || !school_name || !level || !major || !status || 
		 !diploma_number){
            throw new Error("empty info")
        }

        var enrollmentItem = this.data.get(diploma_number);
        if(enrollmentItem){
            throw new Error("student's enrollment has been occupied");
        }
        var index = this.size;
        enrollmentItem = new StudentEnrollmentItem();
        enrollmentItem.name = name;
        enrollmentItem.sex = sex;
        enrollmentItem.id_number = id_number;
		enrollmentItem.school_name = school_name;
        enrollmentItem.level = level;
        enrollmentItem.major = major;
		enrollmentItem.status = status;
		enrollmentItem.diploma_number = diploma_number;
        this.data.put(enrollmentItem.diploma_number,enrollmentItem);
		this.arrayMap.set(index, enrollmentItem.diploma_number);
		this.size +=1;
		  
    },

    get:function(id_number, diploma_number /*optional*/){
        if(!id_number){
            throw new Error("empty id number")
        }
		var arry = new Array();

			for(var i=0;i<this.size;i++)
			{
                var key = this.arrayMap.get(i);
			    var object = this.data.get(key);				
				if(object.id_number == id_number && (!diploma_number || object.diploma_number == diploma_number))
						arry.push(object);
            }
		

		return arry;
    }
}

module.exports = StudentEnrollment;
class User {
  constructor(value) {
    let obj = value ? JSON.parse(value) : {};
    this.id = obj.id || 0;
    this.phone = obj.phone;
    this.nickName = obj.nickName;
  }

  toString() {
    return JSON.stringify(this);
  }
}

class Activity {
  constructor(value) {
    let obj = value ? JSON.parse(value) : {};
    this.id = obj.id || 0;
    this.owner = obj.owner || 0;
    this.participants = obj.participants;
    this.date = obj.date;
    this.title = obj.title;
    this.desc = obj.desc;
    this.location = obj.location;
    this.limit = obj.limit;
  }

  isExpired() {
    return this.date >= new Date();
  }

  toString() {
    return JSON.stringify(this);
  }
}

class TogetherContract {
  constructor() {
    LocalContractStorage.defineProperty(this, "index");

    LocalContractStorage.defineMapProperty(this, "users", {
      parse: function(jsonText) {
        return new User(jsonText);
      },

      stringify: function(obj) {
        return obj.toString();
      }
    });

    LocalContractStorage.defineMapProperty(this, "activities", {
      parse: function(jsonText) {
        return new Activity(jsonText);
      },

      stringify: function(obj) {
        return obj.toString();
      }
    });
  }

  init() {
    this.index = new BigNumber(0);
  }

  getUserInfo() {
    let from = Blockchain.transaction.from;
    return this.users.get(from);
  }

  editInfo(phone, nickName) {
    let from = Blockchain.transaction.from;
    let user = this.users.get(from);
    if (!user) {
      user = new User();
      user.id = from;
    }

    user.phone = phone;
    user.nickName = nickName;
    this.users.put(from, user);
  }

  getAddress() {
  }

  publish(date, location, title, desc, limit) {
    let from = Blockchain.transaction.from;
    let index = this.index;

    let user = this.users.get(from);
    if (!user) {
      throw new Error("User not found");
    }

    if (!date || date <= new Date()) {
      throw new Error("Date is invalidate");
    }

    title = title.trim();
    if (title === "") {
      throw new Error("Title is empty");
    }

    desc = desc.trim();
    if (desc === "") {
      throw new Error("Desc is empty");
    }

    location = location.trim();
    if (location === "") {
      throw new Error("Location is empty");
    }

    if (limit < 2) {
      throw new Error("limit is invalidate");
    }

    let activity = new Activity();
    activity.id = index;
    activity.date = date;
    activity.title = title;
    activity.desc = desc;
    activity.owner = from;
    activity.limit = limit;
    activity.location = location;
    activity.participants = [user];

    this.activities.put(index, activity);

    this.index = new BigNumber(index).plus(1);
  }

  listAll(keyword) {
    return this.list(0, this.index, keyword);
  }

  list(offset, limit, keyword) {
    let arr = [];
    offset = parseInt(offset);
    limit = parseInt(limit);
    if(offset > this.index) {
      throw new Error("Offset is not valid");
    }

    let number = offset + limit;
    if (number > this.index) {
        number = this.index;
    }

    for (let i = offset; i < number; i++) {
      let activity = this.activities.get(i);
      if (activity) {
        if (!activity.isExpired()) {
          if (!keyword) {
            arr.push(activity);
          } else {
            keyword = keyword.trim();
            if (activity.location.contains(keyword) || activity.title.contains(keyword) || activity.desc.contains(keyword)) {
              arr.push(activity);
            }
          }
        } else {
          this.activities.del(index);
        }
      }
    }

    return arr;
  }

  isOwner(index) {
    let activity = this.activities.get(index);
    if (!activity) {
      throw new Error("Activity not found");
    }

    let from = Blockchain.transaction.from;
    return activity.owner === from;
  }

  isParticipant(index) {
    let activity = this.activities.get(index);
    if (!activity) {
      throw new Error("Activity not found");
    }

    let from = Blockchain.transaction.from;
    for (const user of activity.participants) {
      if (user.id === from) {
        return true;
      }
    }

    return false;
  }

  join(index) {
    let activity = this.activities.get(index);
    if (!activity) {
      throw new Error("Activity not found");
    }

    if (activity.isExpired()) {
      throw new Error("Activity is expired");
    }

    let from = Blockchain.transaction.from;
    let user = this.users.get(from);
    if (!user) {
      throw new Error("User not found");
    }

    if (activity.participants.length >= activity.limit) {
      throw new Error("is full");
    }

    if (!this.isParticipant(index)) {
      activity.participants.push(user);
    } else {
      throw new Error("Already exists");
    }

    this.activities.put(activity.id, activity);
  }

  cancel(index) {
    let activity = this.activities.get(index);
    if (!activity) {
      throw new Error("Activity not found");
    }

    if (activity.isExpired()) {
      this.activities.del(index);
      throw new Error("Activity is expired");
    }

    let from = Blockchain.transaction.from;
    let isOwner = activity.owner === from;

    if (!isOwner) {
      throw new Error("Permission denied");
    }

    this.activities.del(index);
  }

  quit(index) {
    let activity = this.activities.get(index);
    if (!activity) {
      throw new Error("Activity not found");
    }

    if (activity.isExpired()) {
      this.activities.del(index);
      throw new Error("Activity is expired");
    }

    let from = Blockchain.transaction.from;
    let user = this.users.get(from);
    if (!user) {
      throw new Error("User not found");
    }

    if (!this.isParticipant(index)) {
      throw new Error("Permission denied");
    }

    if (this.isOwner(index)) {
      throw new Error("Owner unable to exit");
    }

    activity.participants = activity.participants.filter(function(item){
      return item.id !== from;
    });

    this.activities.put(activity.id, activity);
  }

}

module.exports = TogetherContract;
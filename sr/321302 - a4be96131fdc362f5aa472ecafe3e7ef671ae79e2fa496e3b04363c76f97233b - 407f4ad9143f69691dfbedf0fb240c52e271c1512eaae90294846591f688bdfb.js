var CitiesGame = function() {
  LocalContractStorage.defineMapProperty(this, 'counter_to_city');
  LocalContractStorage.defineProperty(this, 'last_city');
  LocalContractStorage.defineProperty(this, 'counter');
};

CitiesGame.prototype = {
  init: function() {
    this.last_city = false;
    this.counter = 0;
  },

  _getAllCities: function() {
    var cities = [];
    for (var i = 0; i < this.counter; i++) {
      var city = this.counter_to_city.get(i);
      cities.push(city);
    }
    return cities;
  },

  getAllCities: function() {
    return _getAllCities();
  },

  _checkForDuplicates: function(city) {
    return !!this._getAllCities().find((obj) => city === obj.city);
  },

  postCity: function(new_city) {
    if (Blockchain.transaction.value != 0) {
      throw new Error(
        'It is free. Save your money for icecream for your children.',
      );
    }

    var user_id = Blockchain.transaction.from;
    var transaction = Blockchain.transaction;
    var firstChar = new_city && new_city[0].trim().toLowerCase();
    var lastCity = this.last_city;
    var lastChar = lastCity && lastCity[lastCity.length - 1].toLowerCase();
    
    if (this._checkForDuplicates(new_city)) {
      return { result: 403, message: `Error: wrong city. You should send another one, this city have already exist.` };
    }

    if (!lastChar || firstChar === lastChar) {
      this.counter_to_city.set(this.counter, { user: user_id, city: new_city, timeStamp: new Date().getTime(), transaction });
      this.last_city = new_city;
      this.counter++;

      return { result: 200, message: 'City pushed successfully! Wait for some time. It should update automatically.', counter: this.counter, lastCity: this.last_city };
    } else {
      return { result: 403, message: `Error: wrong city. You should send city, that name starts from the "${lastChar.toUpperCase()}" char.` }
    }
  },

  getLastCities: function() {
    var cities = [];

    var startCount = 0; 
    var count = this.counter;
    if (count > 10) {
      startCount = count - 10;
    }
    
    for (var i = startCount; i < count; i++) {
      var city = this.counter_to_city.get(i);
      cities.push(city);
    }

    return cities;
  }
};

module.exports = CitiesGame;
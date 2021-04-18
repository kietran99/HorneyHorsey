let eventChannel = {
	eventDict: {},

	raise: function(name, data) {
		if (!this.eventDict.hasOwnProperty(name))
		{
			this.eventDict[name] = new BaseEvent();
		}
		
		this.eventDict[name].raise(data);
	},

	addListener: function(name, callback) {
		if (!this.eventDict.hasOwnProperty(name))
		{
			this.eventDict[name] = new BaseEvent();
		}

		this.eventDict[name].addListener(callback);
	},

	removeListener: function(name, callback) {
		if (!this.eventDict.hasOwnProperty(name))
		{
			cc.log("Callback " + callback + " wasn't added");
			return;
		}

		this.eventDict[name].removeListener(callback);
	}
};

function BaseEvent() {
	this.listeners = [];

	this.raise = (data) => this.listeners.forEach(listener => listener(data));

	this.addListener = (callback) => this.listeners.push(callback);

	this.removeListener = (callback) => this.listeners.splice(this.listeners.indexOf(callback), 1);
}
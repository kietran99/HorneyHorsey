const TurnManager = cc.Node.extend({
	playerList: [],
	turnIndicator: 0,
	ui: null,
	turnNum: 0,

	ctor: function(playerIndices, ui) {
		this._super();

		this.playerList = playerIndices;
		this.turnIndicator = -1;
		this.ui = ui;
		this.turnNum = 0;
		
		eventChannel.addListener("Turn End", data => this.turnEnd());

		//Dice Roll event data: playerIdx: which player turn where 0 <= playerIdx <= 3, val: dice value
		// eventChannel.raise("Dice Roll", { playerIdx: 0, val: this.ui.dice.roll(0) });
		this.turnEnd();

		return true;
	},

	nextTurn: function() {
		this.turnIndicator++;
		if (this.turnIndicator >= this.playerList.length) {
			this.turnIndicator = 0;
		}
	},

	turnEnd: function() {
		this.turnNum++;
		this.nextTurn();
		const diceRoll = this.ui.dice.roll(this.turnIndicator);
		cc.log("Player " + this.turnIndicator + " turn");
		eventChannel.raise("Dice Roll", { playerIdx: this.turnIndicator, val: diceRoll }); 	

		if (diceRoll == 1 || diceRoll == 6) {
			cc.log("Extra Turn");

			this.turnIndicator--;

			if (this.turnIndicator < 0) {
				this.turnIndicator = 3
			}			
		}

		this.ui.updateTurnText(this.turnNum);
	}
});
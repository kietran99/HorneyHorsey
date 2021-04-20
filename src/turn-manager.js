const TurnManager = cc.Node.extend({
	playerList: [],
	turnIndicator: 0,
	ui:null,
	turnNum:0,

	ctor: function(playerIndices, ui) {
		this._super();
		this.playerList = playerIndices;
		// cc.log(this.playerList);
		this.turnIndicator = 0;
		this.ui = ui;
		this.turnNum = 1;
		diceRoll = this.ui.dice.roll();
		
		/*
		Dice Roll event data: playerIdx: which player turn where 0 <= playerIdx <= 3, val: dice value
		*/
		// if (diceRoll ==1 || diceRoll == 6)
		// {
		// 	this.keepPlayerTurn();
		// }
		// this.nextPlayerTurn();

		// eventChannel.addListener()

		eventChannel.addListener("Turn End", data => this.turnEnd());

		// eventChannel.addListener("Turn End", data => {this.nextPlayerTurn});
		// if (diceRoll ==1 || diceRoll == 6)
		// {
		// 	this.keepPlayerTurn();
		// }
		// this.nextPlayerTurn();

		return true;
	},

	nextTurn: function()
	{
		this.turnIndicator++;
		if (this.turnIndicator >= this.playerList.length) {
			this.turnIndicator = 0;
		}
	},

	turnEnd:function(){
		this.turnNum++;
		this.nextTurn();
		diceRoll = this.ui.dice.roll(this.turnIndicator);
		eventChannel.raise("Dice Roll", { playerIdx: this.turnIndicator, val: diceRoll }); 
		cc.log("It's player " + this.turnIndicator + " turn!");

		if (diceRoll == 1 || diceRoll == 6)
		{
			this.turnIndicator -=1;
			if(this.turnIndicator < 0){
				this.turnIndicator = 3
			}
			cc.log("Player " + this.turnIndicator + " get one more turn when dice rolls to " + diceRoll + "!");
		}

		this.ui.updateTurnText(this.turnNum);
	}
});
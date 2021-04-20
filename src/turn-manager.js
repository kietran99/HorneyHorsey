const TurnManager = cc.Node.extend({
	playerList: [],
	turnIndicator: 0,
	ui:null,
	turnNum:0,
	ctor: function(playerIds, ui) {
		this._super();
		this.playerList = playerIds;
		// cc.log(this.playerList);
		this.turnIndicator = 0;
		this.ui = ui;
		this.turnNum = 1;
		diceRoll = this.ui.dice.roll();
		
		/*
		Dice Roll event data: playerId: which player turn where 0 <= playerId <= 3, val: dice value
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
		this.turnIndicator += 1;
		if (this.turnIndicator>= 4) {
			this.turnIndicator = 0;
		}
	},
	turnEnd:function(){
		this.turnNum +=1;
		this.nextTurn();
		diceRoll = this.ui.dice.roll(this.turnIndicator);
		eventChannel.raise("Dice Roll", { playerId: this.turnIndicator, val: diceRoll }); 
		cc.log("it's player " + this.turnIndicator + " turn!");
		if (diceRoll == 1 || diceRoll == 6)
		{
			this.turnIndicator -=1;
			if(this.turnIndicator < 0){
				this.turnIndicator = 3
			}
			cc.log("player " + this.turnIndicator + " get one more turn when dice rolls to "+ diceRoll+"!");
		}
		this.ui.updateTurnText(this.turnNum);
	}
});
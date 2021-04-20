const TurnManager = cc.Node.extend({
	playerList: [],
	turnIndicator: 0,
	dice:null,
	ctor: function(playerIds, dice) {
		this._super();
		this.playerList = playerIds;
		this.turnIndicator = 0
		this.dice = dice
		diceRoll = this.dice.roll();
		if(diceRoll ==1 || diceRoll == 6)
		{
			keepPlayerTurn();
		}
		/*
		Dice Roll event data: playerId: which player turn where 0 <= playerId <= 3, val: dice value
		*/

		eventChannel.addListener("Turn End", data => eventChannel.raise("Dice Roll", { playerId: this.turnIndicator, val: diceRoll }));
		nextPlayerTurn();

		return true;
	},

	nextPlayerTurn: function(){
		this.turnIndicator += 1;
		if(this.turnIndicator>= this.playerList.length){
			this.turnIndicator = 0;
		}
	},
	keepPlayerTurn: function(){
		this.turnIndicator -= 1
	}
});
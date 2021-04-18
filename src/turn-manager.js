const TurnManager = cc.Node.extend({
	ctor: function(playerIds, dice) {
		this._super();

		/*
		Dice Roll event data: playerId: which player turn where 0 <= playerId <= 3, val: dice value
		*/
		eventChannel.addListener("Turn End", data => eventChannel.raise("Dice Roll", { playerId: 3, val: dice.roll() }));

		return true;
	}
});
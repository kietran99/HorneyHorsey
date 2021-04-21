const UICanvas = cc.Node.extend({
	turnLabel: null,
	nTurnsText: null,
	dice: null,

	ctor: function(diceColors) {
		this._super();

		this.turnLabel = new cc.LabelTTF("TURN");
		this.turnLabel.attr({
			x: cc.winSize.width - 40,
			y: cc.winSize.height - 32,
			fontSize: 32
		});

		this.addChild(this.turnLabel, 0);

		this.nTurnsText = new cc.LabelTTF("01");
		this.nTurnsText.attr({
			x: cc.winSize.width - 32,
			y: cc.winSize.height - 64,
			fontSize: 32
		});

		this.addChild(this.nTurnsText, 0);
		
		this.dice = new Dice(diceColors);
		this.addChild(this.dice, 0);

		return true;
	},

	updateTurnText: function(turn) {
		this.nTurnsText.setString((turn < 10 ? "0" : "") + turn);
	}
});

const Dice = cc.Node.extend({
	diceSprite: null,
	digitSprite: null,
	colors: null,
	res: null, // IDK why tf does roll() cannot ref res directly =.=

	ctor: function(colors) {
		this._super();

		const rect = {
				x: cc.winSize.width - 40,
				y: cc.winSize.height / 2,
				scale: SpriteConfig.BASE_SCALE
			}

		this.colors = colors;
		this.diceSprite = drawScaleSprite(res.Dice_png, rect);
		this.digitSprite = drawScaleSprite(res.diceDigit_png(1), rect, colors[0]);
		this.res = res;

		this.addChild(this.diceSprite, 0);
		this.addChild(this.digitSprite, 1);

		return true;
	},

	roll: function(colorIdx) {
		const res = Math.floor(Math.random() * 6) + 1;
		cc.log("Roll Dice: " + res);
		this.digitSprite.color = cc.color(this.colors[colorIdx]);
		this.digitSprite.setTexture(this.res.diceDigit_png(res));
		return res;
	}
});
const UICanvas = cc.Node.extend({
	turnLabel: null,
	nTurnsText: null,
	dice: null,

	ctor: function() {
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

		this.dice = new Dice('#d9e027');
		this.addChild(this.dice, 0);

		return true;
	}
});

const Dice = cc.Node.extend({
	diceSprite: null,
	digitSprite: null,

	ctor: function(digitColor) {
		this._super();

		const rect = {
				x: cc.winSize.width - 40,
				y: cc.winSize.height / 2,
				scale: SpriteConfig.BASE_SCALE
			}

		this.diceSprite = drawScaleSprite(res.Dice_png, rect);

		this.digitSprite = drawScaleSprite(res.diceDigit_png(2), rect, digitColor);

		this.addChild(this.diceSprite, 0);
		this.addChild(this.digitSprite, 1);

		return true;
	}
});
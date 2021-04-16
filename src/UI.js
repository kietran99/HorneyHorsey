const UICanvas = cc.Node.extend({
	turnLabel: null,
	nTurnsText: null,

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

		return true;
	}
});
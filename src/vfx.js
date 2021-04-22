const MoveIndicator = cc.Node.extend({
	hiddenIndicators: null,
	shownIndicators: null,

	playgroundState: null,

	ctor: function(nIndicators, playgroundState) {
		this._super();

		this.hiddenIndicators = makeArray(
			nIndicators, 
			idx => drawScaleSprite(res.Move_Indicator_png, 
            { 
                x: 0,
                y: 0,
                scale: SpriteConfig.BASE_SCALE
         	}));
		
		this.shownIndicators = [];

		this.hiddenIndicators.forEach(indicator => indicator.setVisible(false));
		this.hiddenIndicators.forEach(indicator => this.addChild(indicator, -1));

		this.playgroundState = playgroundState;

		return true;
	},

	reset: function() {		
		while (this.shownIndicators.length > 0) {
			const indicator = this.shownIndicators.pop();
			indicator.setVisible(false);
			this.hiddenIndicators.push(indicator);
		}
	},

	show: function(platformIdx) {
		const indicator = this.hiddenIndicators.pop();
		indicator.setVisible(true);
		indicator.setPosition(this.playgroundState.getPlatformPos(platformIdx));
		this.shownIndicators.push(indicator);
	}
});
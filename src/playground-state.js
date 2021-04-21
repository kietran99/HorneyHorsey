const PlaygroundState = cc.Node.extend({
	N_PLATFORMS_PER_COLOR: 12,

	playground: null,

	platformsOccupationList: null,

	ctor: function(playground) {
		this._super();

		this.playground = playground;

		this.platformsOccupationList = [...Array(this.playground.platformPositions.length).keys()].map(idx => false);
	},

	getHomePos: function(playerIdx) { return this.playground.homePositions[playerIdx]; },

	getHomeIdx: function(playerIdx) { return this.playground.actionHomeIdx(playerIdx); },

	getReleasePos: function(playerIdx) { return this.playground.platformPositions[this.getReleaseIdx(playerIdx)]; },

	getReleaseIdx: function(playerIdx) { return this.N_PLATFORMS_PER_COLOR * playerIdx + 1; },

	getPlatformPos: function(platformIdx) { return this.playground.platformPositions[platformIdx]; },

	getGoalPlatformPos: function(playerIdx, platformIdx) { 
		return this.playground.goalLinesPfPosition[playerIdx][platformIdx]; 
	},

	getGoalPlatformIdx: function(playerIdx, platformIdx) { 
		return this.playground.getGoalPfIdx(playerIdx, platformIdx); 
	},

	requestReleaseIdx: function(playerIdx) {
		const releaseIdx = this.getReleaseIdx(playerIdx);
		return this.platformsOccupationList[releaseIdx] ? None() : Some(releaseIdx);
	},

	requestMoveIdx: function(curIdx, steps) {
		// cc.log("Request Move: Cur Idx: " + curIdx + " Steps: " + steps);
		return this.areObstaclesInTheWay(this.platformsOccupationList, curIdx, steps) 
			? None() 
			: Some(this.getMovedIdx(curIdx, steps));
	},

	areObstaclesInTheWay: function(pfOccList, curIdx, steps) {
		var idx = curIdx;

		for (i = 0; i < steps - 1; i++) {
			idx = idx == 47 ? 0 : idx + 1;
			
			if (pfOccList[idx])
			{
				return true;
			}
		}

		return false;
	},

	getMovedIdx: function(curIdx, steps) { return curIdx + steps - (curIdx + steps >= 48 ? 48 : 0); },

	onRelease: function(playerIdx) {
		cc.log("Release Idx: " + this.getReleaseIdx(playerIdx));
		this.setPosIdx(this.getReleaseIdx(playerIdx), true); 
	},

	onMove: function(curIdx, movedIdx) {
		cc.log("Move: CurIdx = " + curIdx + " MovedIdx = " + movedIdx);
		this.setPosIdx(movedIdx, true);
		this.setPosIdx(curIdx, false);
	},

	setPosIdx: function(idx, shouldOccupy) { this.platformsOccupationList[idx] = shouldOccupy; }
});
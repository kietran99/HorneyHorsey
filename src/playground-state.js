const PlaygroundState = (playground) => ({
	N_PLATFORMS_PER_COLOR: 12,

	platformPositions: null,

	keyIndicesList: null,

	getHomePos: function(playerIdx) { return playground.homePositions[playerIdx]; },

	getHomeIdx: function(playerIdx) { return playground.actionHomeIdx(playerIdx); },

	getReleasePos: function(playerIdx) { return playground.platformPositions[this.getReleaseIdx(playerIdx)]; },

	getReleaseIdx: function(playerIdx) { return 1 + this.N_PLATFORMS_PER_COLOR * playerIdx; },

	getPlatformPos: function(platformIdx) { return playground.platformPositions[platformIdx]; }
});

function KeyIndices(homeIdx, releaseIdx, endIdx) {
	this.homeIdx = homeIdx;
	this.releaseIdx = releaseIdx;
	this.endIdx = endIdx;
}
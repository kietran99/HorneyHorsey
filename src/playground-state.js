function PlaygroundState(playground) {
	this.N_PLATFORMS_PER_COLOR = 12;

	this.platformsOccupationList = [...Array(playground.platformPositions.length).keys()].map(idx => false);

	this.getHomePos = (playerIdx) => { return playground.homePositions[playerIdx]; };

	this.getHomeIdx = (playerIdx) => { return playground.actionHomeIdx(playerIdx); };

	this.getReleasePos = (playerIdx) => { return playground.platformPositions[this.getReleaseIdx(playerIdx)]; };

	this.getReleaseIdx = (playerIdx) => { return this.N_PLATFORMS_PER_COLOR * playerIdx + 1; };

	this.getPlatformPos = (platformIdx) => { return playground.platformPositions[platformIdx]; };

	this.requestReleaseIdx = (playerIdx) => {
		const releaseIdx = this.getReleaseIdx(playerIdx);
		return this.platformsOccupationList[releaseIdx] ? None() : Some(releaseIdx);
	};

	this.onRelease = (playerIdx) => {
		cc.log("Release: " + this.getReleaseIdx(playerIdx));
		this.setPosIdx(this.getReleaseIdx(playerIdx), true); 
	};

	this.onMove = (curIdx, movedIdx) => {
		cc.log("Move: CurIdx = " + curIdx + " MovedIdx = " + movedIdx);
		this.setPosIdx(movedIdx, true);
		this.setPosIdx(curIdx, false);
	};

	this.setPosIdx = (idx, shouldOccupy) => { this.platformsOccupationList[idx] = shouldOccupy; };
};
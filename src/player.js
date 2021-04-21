var nextPlayerIdx = 0;

const Player = cc.Node.extend({
    N_HORSES: 4,
    N_GOAL_PLATFORMS: 6,

    idx: null,

    playgroundState: null,

    idleHorses: [],
    activeHorses: null,

    startHomePos: [],
    emptyHomePos: null,

    endPosHorse: null,
    goalLine: null,
    goalMovable: null,

    ctor: function(playgroundState, horseColor) {
        this._super();
        
        this.idx = nextPlayerIdx++;

        this.playgroundState = playgroundState;

        const [centreOffset, xOffset, yOffset] = [64, -24, -32];
        const homePos = playgroundState.getHomePos(this.idx);

        this.startHomePos = [
            cc.p(homePos.x - centreOffset + xOffset, homePos.y + yOffset),
            cc.p(homePos.x + xOffset, homePos.y - centreOffset + yOffset),
            cc.p(homePos.x + centreOffset + xOffset, homePos.y + yOffset),
            cc.p(homePos.x + xOffset, homePos.y + centreOffset + yOffset)
        ];

        this.emptyHomePos = [];

        this.idleHorses = [...Array(this.N_HORSES).keys()].map(idx => new Horse(this.startHomePos[idx], horseColor));
        this.idleHorses.forEach(horse => this.addChild(horse, 0));
        this.activeHorses = [];

        this.endPosHorse = null;
        this.goalLine = [...Array(this.N_GOAL_PLATFORMS).keys()].map(idx => null);
        this.goalMovable = false;

        eventChannel.addListener("Dice Roll", 
            diceData => (diceData.playerIdx === this.idx) && this.listenToTouchEvent(diceData.val));
        
        eventChannel.addListener("Other Move", 
            movedData => (movedData.playerIdx !== this.idx) && this.onOtherMove(movedData.movedIdx));

        return true;
    },

    listenToTouchEvent: function(diceVal) {
        const actionDict = {};

        if (diceVal == 1 || diceVal == 6) {
            const maybeReleaseIdx = this.requestRelease();

            maybeReleaseIdx
                .match({
                    Some: (releaseIdx) => actionDict[this.playgroundState.getHomeIdx(this.idx)] = () => this.release(releaseIdx),
                    None: () => cc.log("Cannot Release: Release position is blocked")
                });
        }

        if (this.activeHorses.length > 0) {
            const maybeMovedData = this.requestMoveData(diceVal);

            maybeMovedData
                .map(movedData => movedData.forEach(data => 
                    data.maybeMovedIdx.map(movedIdx => 
                        actionDict[movedIdx] = () => this.move(data.horse, movedIdx, diceVal))));
        }

        this.requestEndToGoalMove(diceVal - 1).map(goalPfIdx => 
            actionDict[goalPfIdx] = () => this.endToGoalMove(diceVal - 1));

        this.requestGoalMove(diceVal).map(idxData =>
            actionDict[idxData.toIdx] = () => this.goalLineMove(idxData.fromIdx, diceVal - 1));

        if (Object.keys(actionDict).length === 0) {
            cc.log("Skip Turn");
            setTimeout(() => eventChannel.raise("Turn End", {}), 2000);  
            return;       
        }

        cc.log("Listening for indices: " + Object.keys(actionDict));

        const executeIfIdxValid = idx => {
            if (!actionDict.hasOwnProperty(idx))
            {
                cc.log("Invalid Position Index");
                // setTimeout(()=>{return;},2000);
                return;
            }

            actionDict[idx]();
            eventChannel.removeListener("Object Tap", executeIfIdxValid);
            eventChannel.raise("Turn End", {});
        }

        eventChannel.addListener("Object Tap", executeIfIdxValid);
    },

    requestRelease: function() {
        if (this.idleHorses.length === 0) {
            cc.log("Cannot Release: Home is empty");
            return None();
        }

        return this.playgroundState.requestReleaseIdx(this.idx);
    },

    requestMoveData: function(steps) {
        const nonGoalHorses = this.activeHorses.filter(horse => horse.moveDist + steps <= 48);

        if (nonGoalHorses.length === 0) {
            cc.log("Unmovable: No non goal Horses");
            return None();
        }

        const movedData = 
            nonGoalHorses
                .map(horse => {
                    const maybeMovedIdx = this.playgroundState.requestMoveIdx(horse.posIdx, steps);

                    const isTeammateAtMovedPos = 
                        maybeMovedIdx.match({
                            Some: movedIdx => this.activeHorses.some(horse => horse.posIdx === movedIdx),
                            None: () => false
                        });

                    cc.log("Is Teammate At Moved Pos: " + isTeammateAtMovedPos);

                    return {
                        horse: horse,
                        maybeMovedIdx: isTeammateAtMovedPos ? None() : maybeMovedIdx
                    }
                });

        return Some(movedData); 
    },

    requestEndToGoalMove: function(idxToMove) {
        if (this.endPosHorse === null) {
            cc.log("No horse at end platform");
            return None();
        }

        for (i = idxToMove - 1; i >= 0; i--) {
            if (this.goalLine[i] === null) {
                continue;
            }

            cc.log("Other horses are in the goal way");
            return None();
        }
        
        return Some(this.playgroundState.getGoalPlatformIdx(this.idx, idxToMove));
    },

    requestGoalMove: function(diceVal) {
        const toIdx = diceVal - 1;

        if (this.goalLine[toIdx] !== null) {
            return None();
        }

        for (i = toIdx - 1; i >= 0; i--) {
            if (this.goalLine[i] !== null) {
                return Some({ fromIdx: i, toIdx: this.playgroundState.getGoalPlatformIdx(this.idx, toIdx) });
            }        
        }

        return None();
    },

    release: function(releaseIdx) {
        const horse = new ActiveHorse(
                        this.idleHorses.shift(), 
                        this.playgroundState.getReleasePos(this.idx),
                        releaseIdx);

        this.emptyHomePos.push(this.startHomePos.shift());
        this.activeHorses.push(horse);
        this.playgroundState.onRelease(this.idx);
    },

    move: function(horse, movedIdx, steps) {
        this.playgroundState.onMove(horse.posIdx, movedIdx);
        horse.move(this.playgroundState.getPlatformPos(movedIdx), movedIdx, steps);

        if (horse.moveDist === 48) {
            this.endPosHorse = horse;
        }

        eventChannel.raise("Other Move", { playerIdx: this.idx, movedIdx: movedIdx });
    },

    onOtherMove: function(otherPosIdx) {
        const maybeHorseToKick = find(this.activeHorses, horse => horse.posIdx === otherPosIdx);
        maybeHorseToKick.map(activeHorse => {
            const idleHorse = activeHorse.horse;
            const homePos = this.emptyHomePos.shift();
            idleHorse.setSpriteHomePos(homePos);
            this.startHomePos.push(homePos);
            this.idleHorses.push(idleHorse);
            this.activeHorses.splice(this.activeHorses.indexOf(activeHorse), 1);
        });       
    },

    endToGoalMove: function(movedIdx) {
        // cc.log("End to Goal Idx: " + movedIdx);
        this.goalLine[movedIdx] = this.endPosHorse.horse;
        this.endPosHorse.setSpritePos(this.playgroundState.getGoalPlatformPos(this.idx, movedIdx));
        this.playgroundState.setPosIdx(this.endPosHorse.posIdx, false);
        this.activeHorses.splice(this.activeHorses.indexOf(this.endPosHorse), 1);
        this.endPosHorse = null;
    },

    goalLineMove: function(fromIdx, toIdx) {
        cc.log("Goal Line Move from: " + fromIdx + " to: " + toIdx);
        this.goalLine[fromIdx].setSpritePos(this.playgroundState.getGoalPlatformPos(this.idx, toIdx));
        this.goalLine[toIdx] = this.goalLine[fromIdx];
        this.goalLine[fromIdx] = null;
        this.checkAndDeclareVictory();
    },

    checkAndDeclareVictory: function() {
        for (i = 2; i < this.goalLine.length; i++) {
            if (this.goalLine[i] === null) {
                return;
            }
        }

        cc.log("Victory Player: " + this.idx);
        eventChannel.raise("Victory", { playerId: this.idx });
    }
});

const Horse = cc.Node.extend({
    sprite: null,

    ctor: function(pos, color) {
        this._super();

        this.sprite = drawScaleSprite(
            res.Horse_0_png, 
            { 
                x: pos.x + 8 * SpriteConfig.BASE_SCALE, 
                y: pos.y + 14 * SpriteConfig.BASE_SCALE, 
                scale: SpriteConfig.BASE_SCALE 
            }, 
            color);
        
        this.addChild(this.sprite, 5);

        return true;
    },

    setSpriteHomePos: function(nonOffsetHomePos) {
        this.sprite.setPositionX(nonOffsetHomePos.x + 8 * SpriteConfig.BASE_SCALE);
        this.sprite.setPositionY(nonOffsetHomePos.y + 14 * SpriteConfig.BASE_SCALE);
    },

    setSpritePos: function(newPos) { 
        this.sprite.setPositionX(newPos.x);
        this.sprite.setPositionY(newPos.y + 10 * SpriteConfig.BASE_SCALE);
    }
});

function ActiveHorse(horse, startPos, startPosIdx) {
    this.posIdx = startPosIdx;
    this.moveDist = 1;
    this.horse = horse;

    this.setSpritePos = (movedPos) => {
        this.horse.setSpritePos(movedPos);
    };
    
    this.setSpritePos(startPos);

    this.move = (movedPos, movedIdx, steps) => {
        this.posIdx = movedIdx;
        this.moveDist += steps;
        cc.log("Move Dist: " + this.moveDist);
        this.setSpritePos(movedPos);
    };
};


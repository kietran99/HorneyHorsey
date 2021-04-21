var nextPlayerIdx = 0;

const Player = cc.Node.extend({
    N_HORSES: 4,

    idx: null,

    playgroundState: null,

    idleHorses: [],
    activeHorses: null,

    startHomePos: [],
    emptyHomePos: null,

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

        // TODO Goal actionDict

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

    // genActionDict: function(){
        //},

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
                // .map(horse => ({
                //     horse: horse, 
                //     maybeMovedIdx: this.playgroundState.requestMoveIdx(horse.posIdx, steps) 
                // }));
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

        // return movedData.length === 0 ? None() : Some(movedData);  
        return Some(movedData); 
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
        this.sprite.setPositionY(newPos.y);
    }
});

function ActiveHorse(horse, startPos, startPosIdx) {
    this.posIdx = startPosIdx;
    this.moveDist = 1;
    this.horse = horse;

    this.setSpritePos = (movedPos) => {
        const offsetReleasePos = cc.p(movedPos.x, movedPos.y + 10 * SpriteConfig.BASE_SCALE);
        this.horse.setSpritePos(offsetReleasePos);
    };
    
    this.setSpritePos(startPos);

    this.move = (movedPos, movedIdx, steps) => {
        this.posIdx = movedIdx;
        this.moveDist += steps;
        cc.log("Move Dist: " + this.moveDist);
        this.setSpritePos(movedPos);
    };
};


var nextPlayerIdx = 0;

const Player = cc.Node.extend({
    N_HORSES: 4,

    idx: null,

    playgroundState: null,

    idleHorses: [],
    activeHorses: [],

    startHomePos: [],
    releasePosIdx: null,

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

        this.idleHorses = [...Array(this.N_HORSES).keys()].map(idx => new Horse(this.startHomePos[idx], horseColor));
        this.idleHorses.map(horse => this.addChild(horse, 0));
        
        this.activeHorses = []; 

        this.releasePosIdx = this.playgroundState.getReleaseIdx(this.idx);

        eventChannel.addListener("Dice Roll", diceData => (diceData.playerIdx === this.idx) && this.listenToTouchEvent(diceData.val));

        return true;
    },

    listenToTouchEvent: function(diceVal) {
        let actionDict = {};

        if (diceVal == 1 || diceVal == 6) {
            const maybeReleaseIdx = this.requestRelease();

            maybeReleaseIdx
                .match({
                    Some: (releaseIdx) => actionDict[this.playgroundState.getHomeIdx(this.idx)] = () => this.release(),
                    None: () => cc.log("Cannot Release: Release position is blocked")
                });
        }

        if (this.activeHorses.length > 0) {
            const movedData = this.requestMoveData(diceVal);

            movedData
                .forEach(data => {
                    data.maybeMovedIdx.map(movedIdx => actionDict[movedIdx] = () => this.move(data.horse, diceVal))
                });
        }

        // TODO Goal actionDict

        if (Object.keys(actionDict).length === 0) {
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

        const movedData = nonGoalHorses
                            .map(horse => ({
                                horse: horse, 
                                maybeMovedIdx: this.playgroundState.requestMoveIdx(horse.posIdx, steps) 
                            }));

        return movedData.length === 0 ? None() : movedData;   
    },

    release: function() {
        const horse = new ActiveHorse(
                        this.idleHorses.shift(), 
                        this.playgroundState.getReleasePos(this.idx),
                        this.releasePosIdx);

        this.activeHorses.push(horse);
        this.playgroundState.onRelease(this.idx);
    },

    move: function(horse, steps) {
        this.playgroundState.onMove(horse.posIdx, this.movedIdx(horse.posIdx, steps));
        horse.move(this.playgroundState.getPlatformPos(this.movedIdx(horse.posIdx, steps)), steps);
    },

    movedIdx: function(curIdx, steps) {
        return curIdx + steps - (curIdx + steps >= 48 ? 48 : 0);
    },

    onOtherMove: (otherPosIdx) => {
        const horseToKick = find(this.activeHorses, horse => horse.posIdx === otherPosIdx);
        horseToKick.map(horse => {
            this.idleHorses.push(horseToKick.horse);
            this.activeHorses = this.activeHorses.splice(horse, 1);
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

    setSpritePos: function(newPos) { 
        this.sprite.setPositionX(newPos.x);
        this.sprite.setPositionY(newPos.y);
    }
});

function ActiveHorse(horse, startPos, startPosIdx) {
    this.posIdx = startPosIdx;
    this.moveDist = 1;
    this.horse = horse;

    this.setSpritePos = (movePos) => {
        const offsetReleasePos = cc.p(movePos.x, movePos.y + 10 * SpriteConfig.BASE_SCALE);
        this.horse.setSpritePos(offsetReleasePos);
    };
    
    this.setSpritePos(startPos);

    this.move = (movePos, steps) => {
        this.posIdx += steps;
        this.posIdx = this.posIdx - (this.posIdx > 48 ? 48 : 0);
        this.moveDist += steps;
        // cc.log("Move Dist: " + this.moveDist);
        this.setSpritePos(movePos);
    };
};


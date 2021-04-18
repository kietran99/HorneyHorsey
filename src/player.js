var nextPlayerId = 0;

const Player = cc.Node.extend({
    N_HORSES: 4,

    id: null,

    playground: null,

    startHomePos: [],
    idleHorses: [],
    activeHorses: [],
    releasePos: null,
    releasePosIdx: null,
    endPosIdx: null,

    ctor: function(playground, homeIdx, releasePosIdx, endPosIdx, horseColor) {
        this._super();
        
        this.id = nextPlayerId++;

        this.playground = playground;

        const [centreOffset, xOffset, yOffset] = [64, -24, -32];
        const homePos = playground.homePositions[this.id];

        this.startHomePos = [
            cc.p(homePos.x - centreOffset + xOffset, homePos.y + yOffset),
            cc.p(homePos.x + xOffset, homePos.y - centreOffset + yOffset),
            cc.p(homePos.x + centreOffset + xOffset, homePos.y + yOffset),
            cc.p(homePos.x + xOffset, homePos.y + centreOffset + yOffset)
        ];

        this.idleHorses = [...Array(this.N_HORSES).keys()].map(idx => new Horse(this.startHomePos[idx], horseColor));
        this.idleHorses.map(horse => this.addChild(horse, 0));
        
        this.homeIdx = homeIdx;
        this.releasePosIdx = releasePosIdx;
        this.endPosIdx = endPosIdx;

        this.activeHorses = []; 

        eventChannel.addListener("Dice Roll", diceData => (diceData.playerId === this.id) && this.listenToTouchEvent(diceData.val));

        return true;
    },

    listenToTouchEvent: function(diceVal) {
        let actionDict = {};

        if (diceVal == 1 || diceVal == 6)
        {
            actionDict[this.homeIdx] = () => this.release();
        }

        if (this.activeHorses.length > 0)
        {
            const movableHorses = this.activeHorses.filter(horse => horse.moveDist + diceVal <= 47); 
            movableHorses.forEach(horse => 
                actionDict[this.realIdx(horse.posIdx, diceVal)] = () => this.move(horse, diceVal));
        }

        // TODO Goal actionDict

        cc.log("Listening for indices: " + Object.keys(actionDict));

        if (Object.keys(actionDict).length === 0)
        {
            eventChannel.raise("Turn End", {});
            return;
        }

        const executeIfIdxValid = idx => 
        {
            if (!actionDict.hasOwnProperty(idx))
            {
                cc.log("Invalid Position Index");
                return;
            }

            actionDict[idx]();
            eventChannel.removeListener("Object Tap", executeIfIdxValid);
            eventChannel.raise("Turn End", {});
        }

        eventChannel.addListener("Object Tap", executeIfIdxValid);
    },

    release: function() {
        if (this.idleHorses.length === 0)
        {
            cc.log("Release Error: Home is empty");
            return;
        }
       
        const newlyReleasedHorse = find(this.activeHorses, horse => horse.posIdx === this.releasePosIdx)
        newlyReleasedHorse
            .match({
                Some: (horse) => cc.log("Release Error: A horse is blocking the way"),
                None: () => {
                    const horse = new ActiveHorse(
                        this.idleHorses.shift(), 
                        this.playground.platformPositions[this.releasePosIdx], 
                        this.releasePosIdx);

                    this.activeHorses.push(horse);
                }
            });    
    },

    move: function(horse, steps) {
        horse.move(this.playground.platformPositions[this.realIdx(horse.posIdx, steps)], steps);
    },

    realIdx: function(curIdx, steps){
        return curIdx + steps - (curIdx + steps >= 48 ? 48 : 0)
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
    this.moveDist = 0;
    this.horse = horse;

    this.move = (movePos, steps) => {
        this.posIdx += steps;
        this.posIdx = this.posIdx - (this.posIdx > 48 ? 48 : 0);
        this.moveDist += steps;
        cc.log("Move Dist: " + this.moveDist);
        this.setSpritePos(movePos);
    };

    this.setSpritePos = (movePos) => {
        const offsetReleasePos = cc.p(movePos.x, movePos.y + 10 * SpriteConfig.BASE_SCALE);
        this.horse.setSpritePos(offsetReleasePos);
    };
    
    this.setSpritePos(startPos);
};


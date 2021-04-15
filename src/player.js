const Player = cc.Node.extend({
    N_HORSES: 4,

    startHomePos: [],
    idleHorses: [],

    ctor: function(homePos, horseColor) {
        this._super();
        
        const [centreOffset, xOffset, yOffset] = [64, -24, -32];

        this.startHomePos = [
            cc.p(homePos.x - centreOffset + xOffset, homePos.y + yOffset),
            cc.p(homePos.x + xOffset, homePos.y - centreOffset + yOffset),
            cc.p(homePos.x + centreOffset + xOffset, homePos.y + yOffset),
            cc.p(homePos.x + xOffset, homePos.y + centreOffset + yOffset)
        ];

        this.idleHorses = [...Array(this.N_HORSES).keys()].map(idx => new Horse(this.startHomePos[idx], horseColor));
        this.idleHorses.map(horse => this.addChild(horse, 0));

        return true;
    },
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


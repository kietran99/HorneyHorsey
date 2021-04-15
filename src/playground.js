const Playground = cc.Layer.extend({
	PLATFORMS_PER_SIDE: 6,
	H_PLATFORM_DIST: 16,
	V_PLATFORM_DIST: 0,
    BOT_LEFT_COLOR: '#d9e027',
    TOP_LEFT_COLOR: '#2291e0',
    TOP_RIGHT_COLOR: '#e05222',
    BOT_RIGHT_COLOR: '#22e062',

    homes: [],

    platforms: [],

    ctor: function () {
        this._super();

        var size = cc.winSize;

        const platformSize = 48; // WARNING: RETARDEDLY HARD CODED
        const xOffset = size.width / 2 - platformSize * (this.PLATFORMS_PER_SIDE + 1) - this.H_PLATFORM_DIST * this.PLATFORMS_PER_SIDE;
        
        this.platforms = this.initAllPlatforms(size, platformSize);
        this.platforms.forEach(platform => platform.setPositionX(platform.getPositionX() + xOffset));
        this.platforms.forEach(platform => this.addChild(platform, 0));

        this.homes = this.initAllHomes(this.platforms[0].width);
        this.homes.forEach(home => home.setPositionX(home.getPositionX() + xOffset));
        this.homes.forEach(home => this.addChild(home, 0));

        return true;
    },

    initAllPlatforms: function(screenSize, platformSize) {
        const makePlatform = color => (x, y) => drawSprite(
            res.Platform_png, 
            { x: x, y: y, width: platformSize, height: platformSize }, 
            color);

        const botLeft = this.initPlatformQuadrant(
            cc.p(platformSize, screenSize.height / 2),
            
            idx => cc.p(
                platformSize * (idx + 1) + this.H_PLATFORM_DIST * idx, 
                screenSize.height / 2 - platformSize - this.V_PLATFORM_DIST),
            
            (lastPos, idx) => cc.p(lastPos.x, lastPos.y - (platformSize + this.V_PLATFORM_DIST) * (idx + 1)),

            makePlatform(this.BOT_LEFT_COLOR));
        
        const tlMaxY = screenSize.height / 2 + platformSize * (this.PLATFORMS_PER_SIDE) + this.V_PLATFORM_DIST * this.PLATFORMS_PER_SIDE;
        const topLeft = this.initPlatformQuadrant(
            cc.p(platformSize * (this.PLATFORMS_PER_SIDE + 1) + this.H_PLATFORM_DIST * this.PLATFORMS_PER_SIDE, tlMaxY),

            idx => cc.p(
                platformSize * (this.PLATFORMS_PER_SIDE) + this.H_PLATFORM_DIST * (this.PLATFORMS_PER_SIDE - 1), 
                tlMaxY - (platformSize + this.V_PLATFORM_DIST) * idx),

            (lastPos, idx) => cc.p(lastPos.x - (platformSize + this.H_PLATFORM_DIST) * (idx + 1), lastPos.y),

            makePlatform(this.TOP_LEFT_COLOR));

        const trMaxX = platformSize * (2 * this.PLATFORMS_PER_SIDE + 1) + this.H_PLATFORM_DIST * (2 * this.PLATFORMS_PER_SIDE);
        const topRight = this.initPlatformQuadrant(
            cc.p(trMaxX, screenSize.height / 2),

            idx => cc.p(
                trMaxX - (platformSize + this.H_PLATFORM_DIST) * idx, 
                screenSize.height / 2 + platformSize + this.V_PLATFORM_DIST),

            (lastPos, idx) => cc.p(lastPos.x, lastPos.y + (platformSize + this.V_PLATFORM_DIST) * (idx + 1)),

            makePlatform(this.TOP_RIGHT_COLOR));

        const brMinX = platformSize * (this.PLATFORMS_PER_SIDE + 1) + this.H_PLATFORM_DIST * this.PLATFORMS_PER_SIDE;
        const brMinY = screenSize.height / 2 - platformSize * this.PLATFORMS_PER_SIDE;
        const botRight = this.initPlatformQuadrant(
            cc.p(brMinX, brMinY),

            idx => cc.p(
                brMinX + platformSize + this.H_PLATFORM_DIST, 
                brMinY + (platformSize + this.V_PLATFORM_DIST) * idx),

            (lastPos, idx) => cc.p(lastPos.x + (platformSize + this.H_PLATFORM_DIST) * (idx + 1), lastPos.y),

            makePlatform(this.BOT_RIGHT_COLOR));

        const allPlatforms = botLeft.concat(topLeft).concat(topRight).concat(botRight);
        return allPlatforms;
    },


    /*
    getLongSidePlatformPos: (idx) => cc.Point
    getShortSidePlatformPos: (lastPos, idx) => cc.Point
    makePlatform: (x, y) => cc.Sprite
    */

    initPlatformQuadrant: function(singlePlatformPos, getLongSidePlatformsPos, getShortSidePlatformPos, makePlatform) {
        const platforms = 
            [makePlatform(singlePlatformPos.x, singlePlatformPos.y)]
            .concat([...Array(this.PLATFORMS_PER_SIDE).keys()]
                    .map(idx => {
                        const pt = getLongSidePlatformsPos(idx);
                        return makePlatform(pt.x, pt.y);
                        }
                    ));

        const lastPos = platforms[platforms.length - 1].getPosition();

        return platforms.concat(
            [...Array(this.PLATFORMS_PER_SIDE - 1).keys()]
            .map(idx => {
                const pt = getShortSidePlatformPos(lastPos, idx);
                return makePlatform(pt.x, pt.y);
            }));
    },

    initAllHomes: function(platformSize) {
        const width = (platformSize + this.H_PLATFORM_DIST) * (this.PLATFORMS_PER_SIDE - 1);
        const height = platformSize * (this.PLATFORMS_PER_SIDE - 1) - 16;
        const margin = 16;
        const nShortPlatforms = 3;

        const makeHome = (x, y) => drawSprite(res.Home_png, { x: x, y: y, width: width, height: height });

        const homes =
            [
                makeHome(
                    width / 2 + margin, 
                    height / 2 + margin),                                                       // bottom left

                makeHome(
                    width / 2 + margin, 
                    height / 2 + height + margin * 2 + (platformSize) * nShortPlatforms),    	// top left

                makeHome(
                    width / 2 + margin + width + (platformSize + this.H_PLATFORM_DIST) * nShortPlatforms, 
                    height / 2 + 16),                                                           // bottom right

                makeHome(
                    width / 2 + margin + width + (platformSize + this.H_PLATFORM_DIST) * nShortPlatforms, 
                    height / 2 + height + margin * 2 + (platformSize) * nShortPlatforms)     	// top right
            ];

        return homes;
    },

    homePosition: function(idx) { return this.homes[idx].getPosition(); }
});
const Playground = cc.Layer.extend({
	PLATFORMS_PER_SIDE: 6,
	H_PLATFORM_DIST: 16,
	V_PLATFORM_DIST: 0,

    maxX: null,
    maxY: null,
    minX: null,
    minY: null,

    homeWidth: null,
    homeHeight: null,
    homes: [],
    homePositions: [],

    platformColors: ['#d9e027', '#22e062', '#e05222', '#2291e0'],
    platformSize: null,
    platforms: [],
    platformPositions: [],

    goalLines: [],
    goalLinesPlatPositions: [],

    ctor: function () {
        this._super();

        const size = cc.winSize;
        const platformSize = 48; // WARNING: RETARDEDLY HARD CODED
        this.platformSize = platformSize;
        // const xOffset = size.width / 2 - platformSize * (this.PLATFORMS_PER_SIDE + 1) - this.H_PLATFORM_DIST * this.PLATFORMS_PER_SIDE;
        const xOffset = 0;

        this.platforms = this.initAllPlatforms(size, platformSize);
        this.platforms.forEach(platform => platform.setPositionX(platform.getPositionX() + xOffset));
        this.platformPositions = this.platforms.map(platform => platform.getPosition());
        this.platforms.forEach(platform => this.addChild(platform, 0));

        this.homes = this.initHomes(this.platforms[0].width);
        this.homes.forEach(home => home.setPositionX(home.getPositionX() + xOffset));
        this.homeWidth = this.homes[0].width;
        this.homeHeight = this.homes[0].height;
        this.homePositions = this.homes.map(home => home.getPosition());
        this.homes.forEach(home => this.addChild(home, 0));

        const goalLineColors = ['#afaf04', '#056bc2', '#c53008', '#00b945'];
        this.goalLines = this.initAllGoalLines(goalLineColors);
        this.goalLines.forEach(goalLine => this.offset(goalLine, xOffset));
        this.goalLines.forEach(goalLine => this.addChildNodes(goalLine));

        return true;
    },

    offset: function(nodes, xOffset) { nodes.forEach(node => node.setPositionX(node.getPositionX() + xOffset)); },

    addChildNodes: function(nodes) { nodes.forEach(node => this.addChild(node, 0)); },

    initAllPlatforms: function(screenSize, platformSize) {
        const makePlatform = color => (x, y) => drawSprite(
            res.Platform_png, 
            { x: x, y: y, width: platformSize, height: platformSize }, 
            color);

        this.maxX = platformSize * (2 * this.PLATFORMS_PER_SIDE + 1) + this.H_PLATFORM_DIST * (2 * this.PLATFORMS_PER_SIDE);
        this.maxY = screenSize.height / 2 + platformSize * (this.PLATFORMS_PER_SIDE) + this.V_PLATFORM_DIST * this.PLATFORMS_PER_SIDE;
        this.minX = platformSize;
        this.minY = screenSize.height / 2 - platformSize * this.PLATFORMS_PER_SIDE;

        const botLeft = this.initPlatformQuadrant(
            cc.p(this.minX, screenSize.height / 2),
            
            idx => cc.p(
                platformSize * (idx + 1) + this.H_PLATFORM_DIST * idx, 
                screenSize.height / 2 - platformSize - this.V_PLATFORM_DIST),
            
            (lastPos, idx) => cc.p(lastPos.x, lastPos.y - (platformSize + this.V_PLATFORM_DIST) * (idx + 1)),

            makePlatform(this.platformColors[0]));
        
        const topLeft = this.initPlatformQuadrant(
            cc.p(platformSize * (this.PLATFORMS_PER_SIDE + 1) + this.H_PLATFORM_DIST * this.PLATFORMS_PER_SIDE, this.maxY),

            idx => cc.p(
                platformSize * (this.PLATFORMS_PER_SIDE) + this.H_PLATFORM_DIST * (this.PLATFORMS_PER_SIDE - 1), 
                this.maxY - (platformSize + this.V_PLATFORM_DIST) * idx),

            (lastPos, idx) => cc.p(lastPos.x - (platformSize + this.H_PLATFORM_DIST) * (idx + 1), lastPos.y),

            makePlatform(this.platformColors[3]));

        const topRight = this.initPlatformQuadrant(
            cc.p(this.maxX, screenSize.height / 2),

            idx => cc.p(
                this.maxX - (platformSize + this.H_PLATFORM_DIST) * idx, 
                screenSize.height / 2 + platformSize + this.V_PLATFORM_DIST),

            (lastPos, idx) => cc.p(lastPos.x, lastPos.y + (platformSize + this.V_PLATFORM_DIST) * (idx + 1)),

            makePlatform(this.platformColors[2]));

        const brMinX = platformSize * (this.PLATFORMS_PER_SIDE + 1) + this.H_PLATFORM_DIST * this.PLATFORMS_PER_SIDE;
        const botRight = this.initPlatformQuadrant(
            cc.p(brMinX, this.minY),

            idx => cc.p(
                brMinX + platformSize + this.H_PLATFORM_DIST, 
                this.minY + (platformSize + this.V_PLATFORM_DIST) * idx),

            (lastPos, idx) => cc.p(lastPos.x + (platformSize + this.H_PLATFORM_DIST) * (idx + 1), lastPos.y),

            makePlatform(this.platformColors[1]));

        const allPlatforms = botLeft.concat(botRight).concat(topRight).concat(topLeft);
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

    initHomes: function(platformSize) {
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
                    width / 2 + margin + width + (platformSize + this.H_PLATFORM_DIST) * nShortPlatforms, 
                    height / 2 + 16),                                                           // bottom right

                makeHome(
                    width / 2 + margin + width + (platformSize + this.H_PLATFORM_DIST) * nShortPlatforms, 
                    height / 2 + height + margin * 2 + (platformSize) * nShortPlatforms),        // top right

                makeHome(
                    width / 2 + margin, 
                    height / 2 + height + margin * 2 + (platformSize) * nShortPlatforms)    	// top left
            ];

        return homes;
    },

    homePosition: function(idx) { return this.homes[idx].getPosition(); },

    actionHomeIdx: homeIdx => 100 * (homeIdx + 1),

    initAllGoalLines: function(colors) {
        const distFromMinMaxX = this.H_PLATFORM_DIST;
        const leftLine = this.initGoalLine(idx => 
            cc.p(this.minX + distFromMinMaxX + (48 + 2) * (idx + 1), cc.winSize.height / 2), colors[0]);

        const distFromMaxY = 2;
        const topLine = this.initGoalLine(idx => 
            cc.p(
                48 * (this.PLATFORMS_PER_SIDE + 1) + this.H_PLATFORM_DIST * this.PLATFORMS_PER_SIDE, 
                this.maxY - distFromMaxY - this.V_PLATFORM_DIST - (48 - 8) * (idx + 1)), 
            colors[1]);

        const rightLine = this.initGoalLine(idx => 
            cc.p(this.maxX - distFromMinMaxX - (48 + 2) * (idx + 1), cc.winSize.height / 2), colors[2]);

        const distFromMinY = 48;
        const botLine = this.initGoalLine(idx => 
            cc.p(
                48 * (this.PLATFORMS_PER_SIDE + 1) + this.H_PLATFORM_DIST * this.PLATFORMS_PER_SIDE, 
                this.minY + distFromMinY + this.V_PLATFORM_DIST + (48 - 8) * (6 - (idx + 1))), 
            colors[3], true);

        return [leftLine, topLine, rightLine, botLine];
    },

    /*
        getPlatPosFn: (idx) => cc.Point
    */

    initGoalLine: function(getPlatPosFn, color, reverse=false) {
        return [...Array(this.PLATFORMS_PER_SIDE).keys()]
            .map(idx => new GoalPlatform(reverse ? this.PLATFORMS_PER_SIDE - idx : idx + 1, getPlatPosFn(idx), color));
    }
});

const GoalPlatform = cc.Node.extend({
    platform: null,
    top: null,
    digit: null,

    ctor: function(digit, pos, color) {
        this._super();

        this.platform = drawScaleSprite(res.Goal_png, { x: pos.x, y: pos.y, scale: SpriteConfig.BASE_SCALE }, color);
        this.top = drawScaleSprite(res.Goal_Top_png, { x: pos.x, y: pos.y, scale: SpriteConfig.BASE_SCALE });
        this.digit = drawScaleSprite(res.digit_png(digit), { x: pos.x, y: pos.y, scale: SpriteConfig.BASE_SCALE }, color);

        this.addChild(this.platform, 0);
        this.addChild(this.top, 0);
        this.addChild(this.digit, 1);

        return true;
    }
});
/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
 http://www.cocos2d-x.org
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
// import { PlaygroundLayer } from './PlaygroundLayer';

const PIXELS_PER_UNIT = 48;
const PLATFORMS_PER_SIDE = 6;
const H_PLATFORM_DIST = 16;
const V_PLATFORM_DIST = 0;

const PlaygroundLayer = cc.Layer.extend({
    homes: [],
    platforms: [],

    ctor:function () {
        this._super();

        var size = cc.winSize;

        // var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
        // helloLabel.x = size.width / 2;
        // helloLabel.y = size.height / 2 + 200;
        // this.addChild(helloLabel, 5);

        const platformSize = PIXELS_PER_UNIT;
        const xOffset = size.width / 2 - platformSize * (PLATFORMS_PER_SIDE + 1) - H_PLATFORM_DIST * PLATFORMS_PER_SIDE;
        
        this.platforms = this.initAllPlatforms(size, platformSize);
        this.platforms.forEach(platform => platform.setPositionX(platform.getPositionX() + xOffset));
        this.platforms.forEach(platform => this.addChild(platform, 0));

        this.homes = this.initAllHomes();
        this.homes.forEach(home => home.setPositionX(home.getPositionX() + xOffset));
        this.homes.forEach(home => this.addChild(home, 0));

        return true;
    },

    initAllPlatforms: function(screenSize, platformSize) {
        const makePlatform = color => (x, y) => this.drawSprite(
            res.Platform_png, 
            { x: x, y: y, width: platformSize, height: platformSize }, 
            color);

        // const botLeft = this.initPlatformQuadrant(screenSize, platformSize, makePlatform('#d9e027'));
        const botLeft = this.initBotLeftPlatforms(screenSize, platformSize, makePlatform('#d9e027'));
        const topLeft = this.initTopLeftPlatforms(screenSize, platformSize, makePlatform('#2291e0'));
        const topRight = this.initTopRightPlatforms(screenSize, platformSize, makePlatform('#e05222'));
        const botRight = this.initBotRightPlatforms(screenSize, platformSize, makePlatform('#22e062'));

        const allPlatforms = botLeft.concat(topLeft).concat(topRight).concat(botRight);
        return allPlatforms;
    },

    initPlatformQuadrant: function(screenSize, platformSize, makePlatform) {
        var platforms = 
            [makePlatform(platformSize, screenSize.height / 2)]
            .concat([...Array(PLATFORMS_PER_SIDE).keys()]
                    .map(idx => 
                        makePlatform(
                            platformSize * (idx + 1) + H_PLATFORM_DIST * idx, 
                            screenSize.height / 2 - platformSize - V_PLATFORM_DIST)
                        ));

        const lastX = platforms[platforms.length - 1].getPositionX();

        return platforms.concat(
            [...Array(PLATFORMS_PER_SIDE - 1).keys()]
            .map(idx => makePlatform(lastX, screenSize.height / 2 - platformSize - V_PLATFORM_DIST - platformSize * (idx + 1))));
    },

    initBotLeftPlatforms: function(screenSize, platformSize, makePlatform) {
        const platforms = 
            [makePlatform(platformSize, screenSize.height / 2)]
            .concat([...Array(PLATFORMS_PER_SIDE).keys()]
                    .map(idx => 
                        makePlatform(
                            platformSize * (idx + 1) + H_PLATFORM_DIST * idx, 
                            screenSize.height / 2 - platformSize - V_PLATFORM_DIST)
                        ));

        const lastPos = platforms[platforms.length - 1].getPosition();

        return platforms.concat(
            [...Array(PLATFORMS_PER_SIDE - 1).keys()]
            .map(idx => makePlatform(lastPos.x, lastPos.y - (platformSize + V_PLATFORM_DIST) * (idx + 1))));
    },

    initTopLeftPlatforms: function(screenSize, platformSize, makePlatform) {
        const maxY = screenSize.height / 2 + platformSize * (PLATFORMS_PER_SIDE) + V_PLATFORM_DIST * PLATFORMS_PER_SIDE;

        const platforms = 
            [makePlatform(
                platformSize * (PLATFORMS_PER_SIDE + 1) + H_PLATFORM_DIST * PLATFORMS_PER_SIDE, 
                maxY)]
            .concat([...Array(PLATFORMS_PER_SIDE).keys()]
                    .map(idx => 
                        makePlatform(
                            platformSize * (PLATFORMS_PER_SIDE) + H_PLATFORM_DIST * (PLATFORMS_PER_SIDE - 1), 
                            maxY - (platformSize + V_PLATFORM_DIST) * idx)
                        ));

        const lastPos = platforms[platforms.length - 1].getPosition();

        return platforms.concat(
            [...Array(PLATFORMS_PER_SIDE - 1).keys()]
            .map(idx => makePlatform(lastPos.x - (platformSize + H_PLATFORM_DIST) * (idx + 1), lastPos.y)));
    },

    initTopRightPlatforms: function(screenSize, platformSize, makePlatform) {
        const maxX = platformSize * (2 * PLATFORMS_PER_SIDE + 1) + H_PLATFORM_DIST * (2 * PLATFORMS_PER_SIDE);

        const platforms = 
            [makePlatform(maxX, screenSize.height / 2)]
            .concat([...Array(PLATFORMS_PER_SIDE).keys()]
                    .map(idx => 
                        makePlatform(
                            maxX - (platformSize + H_PLATFORM_DIST) * idx, 
                            screenSize.height / 2 + platformSize + V_PLATFORM_DIST)
                        ));

        const lastPos = platforms[platforms.length - 1].getPosition();

        return platforms.concat(
            [...Array(PLATFORMS_PER_SIDE - 1).keys()]
            .map(idx => makePlatform(lastPos.x, lastPos.y + (platformSize + V_PLATFORM_DIST) * (idx + 1))));
    },

    initBotRightPlatforms: function(screenSize, platformSize, makePlatform) {
        const minX = platformSize * (PLATFORMS_PER_SIDE + 1) + H_PLATFORM_DIST * PLATFORMS_PER_SIDE;
        const minY = screenSize.height / 2 - platformSize * PLATFORMS_PER_SIDE;

        const platforms = 
            [makePlatform(minX, minY)]
            .concat([...Array(PLATFORMS_PER_SIDE).keys()]
                    .map(idx => 
                        makePlatform(
                            minX + platformSize + H_PLATFORM_DIST, 
                            minY + (platformSize + V_PLATFORM_DIST) * idx)
                        ));

        const lastPos = platforms[platforms.length - 1].getPosition();

        return platforms.concat(
            [...Array(PLATFORMS_PER_SIDE - 1).keys()]
            .map(idx => makePlatform(lastPos.x + (platformSize + H_PLATFORM_DIST) * (idx + 1), lastPos.y)));
    },

    initAllHomes: function() {
        const width = (PIXELS_PER_UNIT + H_PLATFORM_DIST) * (PLATFORMS_PER_SIDE - 1);
        const height = PIXELS_PER_UNIT * (PLATFORMS_PER_SIDE - 1) - 16;
        const margin = 16;
        const nShortPlatforms = 3;

        const makeHome = (x, y) => this.drawSprite(res.Home_png, { x: x, y: y, width: width, height: height });

        const homes =
            [
                makeHome(
                    width / 2 + margin, 
                    height / 2 + margin),                                                       // bottom left

                makeHome(
                    width / 2 + margin, 
                    height / 2 + height + margin * 2 + (PIXELS_PER_UNIT) * nShortPlatforms),    // top left

                makeHome(
                    width / 2 + margin + width + (PIXELS_PER_UNIT + H_PLATFORM_DIST) * nShortPlatforms, 
                    height / 2 + 16),                                                           // bottom right

                makeHome(
                    width / 2 + margin + width + (PIXELS_PER_UNIT + H_PLATFORM_DIST) * nShortPlatforms, 
                    height / 2 + height + margin * 2 + (PIXELS_PER_UNIT) * nShortPlatforms)     // top right
            ];

        return homes;
    },

    drawSprite: function(sprite, rect, color='#ffffff') {
        var sprite = new cc.Sprite(sprite);
        sprite.attr({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            color: cc.color(color),
        });
        sprite.getTexture().setAliasTexParameters();
        return sprite;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var playgroundLayer = new PlaygroundLayer();
        this.addChild(playgroundLayer);
    }
});


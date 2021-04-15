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
const Horse = cc.Node.extend({
    PLATFORMS_PER_SIDE: 6,
    H_PLATFORM_DIST: 16,
    V_PLATFORM_DIST: 0,

    sprite: null,

    ctor: function() {
        this._super();

        const screenSize = cc.winSize;
        const platformSize = 48;
        const width = (platformSize + this.H_PLATFORM_DIST) * (this.PLATFORMS_PER_SIDE - 1);
        const height = platformSize * (this.PLATFORMS_PER_SIDE - 1) - 16;

        this.sprite = drawScaleSprite(res.Horse_0_png, { x: width / 2 + 8 * BASE_SCALE, y: height / 2 + 14 * BASE_SCALE, scale: BASE_SCALE }, '#ecfa4e');
        // this.sprite = drawScaleSprite(
        //     res.Horse_0_png, 
        //     { x: platformSize + 16 * BASE_SCALE, y: screenSize.height / 2 + (7 + 3) * BASE_SCALE, scale: BASE_SCALE }, 
        //     '#ecfa4e'); // Place horse on single yellow platform
        this.addChild(this.sprite, 5);
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        this.addChild(new PlaygroundLayer());
        this.addChild(new Horse());
    }
});


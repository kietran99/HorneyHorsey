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

const RES_ROOT = "res/";

var res = {
    PixelFont_ttf: RES_ROOT + "VCR_OSD_MONO_1.001.ttf",

    Platform_png : RES_ROOT + "Platform.png",
    Home_png : RES_ROOT + "Home.png",
    Horse_0_png: RES_ROOT + "Horse_0.png",
    Goal_png: RES_ROOT + "Goal.png",
    Goal_Top_png: RES_ROOT + "Goal_Top.png",
    Num_pngs: [
    	RES_ROOT + "Num_1.png",
    	RES_ROOT + "Num_2.png",
    	RES_ROOT + "Num_3.png",
    	RES_ROOT + "Num_4.png",
    	RES_ROOT + "Num_5.png",
    	RES_ROOT + "Num_6.png"
    ],
    digit_png: function(digit) {
    	return (digit > 0 && digit < 7) ? this.Num_pngs[digit - 1] : this.Num_pngs[0];
    }
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}

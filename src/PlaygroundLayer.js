// const PlaygroundLayer = 
// cc.Layer.extend({
//     platforms: [],
//     ctor:function () {
//         this._super();

//         var size = cc.winSize;

//         // var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
//         // helloLabel.x = size.width / 2;
//         // helloLabel.y = size.height / 2 + 200;
//         // this.addChild(helloLabel, 5);

//         var sprite = new cc.Sprite(res.Platform_png);
//         sprite.attr({
//             x: 64,
//             y: size.height / 2 - 32,
//             width: 64,
//             height: 64,
//         });
//         sprite.getTexture().setAliasTexParameters();
//         this.platforms.push(sprite)
//         this.addChild(this.platforms[0], 0);

//         return true;
//     },
//     initPlatforms: function() {
//         var sprite = new cc.Sprite(res.Platform_png);
//         this.sprite.attr({
//             x: 64 + 16,
//             y: size.height / 2 - 32,
//             width: 64,
//             height: 64,
//         });
//         sprite.getTexture().setAliasTexParameters();
//         return sprite;
//     }
// });

// export { PlaygroundLayer };
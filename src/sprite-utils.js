const SpriteConfig = {
    BASE_SCALE: 3
};

function drawSprite(sprite, rect, color='#ffffff') {
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

function drawScaleSprite(sprite, rect, color='#ffffff') {
    var sprite = new cc.Sprite(sprite);

    sprite.attr({
        x: rect.x,
        y: rect.y,
        scale: rect.scale,
        color: cc.color(color),
    });

    sprite.getTexture().setAliasTexParameters();

    return sprite;
}
const ControlLayer = cc.Layer.extend({
    playground: null,

    ctor: function(playground, player) {
        this._super();

        this.playground = playground;

        if (!cc.sys.capabilities.hasOwnProperty("touches"))
        {
            return true;
        }

        cc.eventManager.addListener(
        {
            playground: this.playground,

            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan: function(touch, event) {
                // cc.log("Touch Position: (" + touch.getLocation().x + ", " + touch.getLocation().y + ")");
                
                const checkHomeTap = this.checkObjectTap(
                    touch.getLocation(), 
                    (tapPos, objPos) => 
                        Math.pow(tapPos.y - objPos.y, 2) <= Math.pow(this.playground.homeHeight / 2, 2) &&
                        Math.pow(tapPos.x - objPos.x, 2) <= Math.pow(this.playground.homeWidth / 2, 2)
                    );

                const checkPlatformTap = this.checkObjectTap(
                    touch.getLocation(), 
                    (tapPos, objPos) => this.calcSqrDist(tapPos, objPos) <= Math.pow(this.playground.platformSize / 2, 2));

                const maybeHomeIdx = this.findIdx(this.playground.homePositions, checkHomeTap);
                maybeHomeIdx
                    .match({
                        Some: homeIdx => eventChannel.raise("Object Tap", this.playground.actionHomeIdx(homeIdx)),
                        None: () => {
                            const maybePfIdx = this.findIdx(this.playground.platformPositions, checkPlatformTap);
                            maybePfIdx
                                .match({
                                    Some: pfIdx => eventChannel.raise("Object Tap", pfIdx),
                                    None: () => {
                                        let foundTappedObj = false;

                                        for (i = 0; i < 4; i++)
                                        {
                                            const maybeGoalPfIdx = this.findIdx(
                                                this.playground.goalLinesPfPosition[i], 
                                                checkPlatformTap);

                                            maybeGoalPfIdx
                                            .match({
                                                Some: goalPfIdx => {
                                                    eventChannel.raise(
                                                    "Object Tap", 
                                                    this.playground.getGoalPfIdx(i, goalPfIdx));

                                                    foundTappedObj = true;
                                                },
                                                None: () => foundTappedObj = false
                                            });

                                            if (foundTappedObj)
                                            {
                                                break;
                                            }
                                        }  

                                        if (!foundTappedObj) cc.log("No Object was tapped");                                               
                                    }
                                });
                        }
                    });

                return true;
            },

            checkObjectTap: function(tapPos, isOverObjFn) {
                return objPos => isOverObjFn(tapPos, objPos);
            },

            calcSqrDist: (tapPos, objPos) => Math.pow(tapPos.x - objPos.x, 2) + Math.pow(tapPos.y - objPos.y, 2),

            // pred: element => bool
            findIdx: function(iter, pred, curIdx = 0) {
                return iter.length === 0 ? None() : (pred(iter[0]) ? Some(curIdx) : this.findIdx(iter.slice(1), pred, curIdx + 1));
            }
        }, this);

        return true;
    }
});
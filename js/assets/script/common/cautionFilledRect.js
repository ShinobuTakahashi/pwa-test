window.gLocalAssetContainer["cautionFilledRect"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commonDefine_1 = require("./commonDefine");
const entityUtil_1 = require("../util/entityUtil");
const gameUtil_1 = require("../util/gameUtil");
/**
 * 残り時間警告の赤点滅演出を管理するクラス
 */
class CautionFilledRect extends g.FilledRect {
    constructor(_scene) {
        super({
            scene: _scene,
            cssColor: commonDefine_1.commonDefine.CAUTION_FILLRECT_COLOR,
            width: _scene.game.width,
            height: _scene.game.height
        });
        this.hide();
    }
    /**
     * 点滅状態を取得する
     * @return {boolean} 点滅中ならばtrue
     */
    isBlinking() {
        return this.isBlinking_;
    }
    /**
     * 赤点滅演出を開始する
     */
    startBlink() {
        this.isBlinking_ = true;
        this.setTween();
        entityUtil_1.entityUtil.showEntity(this);
    }
    /**
     * 赤点滅演出を終了する
     */
    stopBlink() {
        this.isBlinking_ = false;
        entityUtil_1.entityUtil.hideEntity(this);
        // stopBlinkのあと実行中のtweenが終了する前にstartBlinkされると
        // 正常に動かないが仕様上起きない前提とする。
    }
    /**
     * 赤点滅一周期分のtweenを設定する
     */
    setTween() {
        this.opacity = commonDefine_1.commonDefine.CAUTION_FILLRECT_OPACITY_OFF;
        const timeline = this.scene.game.vars.scenedata.timeline;
        const fps = this.scene.game.fps;
        gameUtil_1.gameUtil.createTween(timeline, this).
            to({ opacity: commonDefine_1.commonDefine.CAUTION_FILLRECT_OPACITY_ON }, commonDefine_1.commonDefine.CAUTION_TIME_ON * 1000 / fps).
            to({ opacity: commonDefine_1.commonDefine.CAUTION_FILLRECT_OPACITY_OFF }, commonDefine_1.commonDefine.CAUTION_TIME_OFF * 1000 / fps).
            call(() => {
            if (this.isBlinking_) {
                this.setTween();
            }
        });
    }
}
exports.CautionFilledRect = CautionFilledRect;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
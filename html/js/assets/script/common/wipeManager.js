window.gLocalAssetContainer["wipeManager"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameUtil_1 = require("../util/gameUtil");
const entityUtil_1 = require("../util/entityUtil");
const commonAsaInfo_1 = require("./commonAsaInfo");
const asaEx_1 = require("../util/asaEx");
/**
 * ワイプ演出を管理するクラス
 */
class WipeManager extends g.E {
    constructor(_scene) {
        super({ scene: _scene });
        this.fadeAsa = new asaEx_1.asaEx.Actor(_scene, commonAsaInfo_1.CommonAsaInfo.nwCommon.pj);
        this.fadeAsa.x = _scene.game.width / 2;
        this.fadeAsa.y = _scene.game.height / 2;
        this.fadeAsa.pause = true;
        this.append(this.fadeAsa);
        entityUtil_1.entityUtil.hideEntity(this.fadeAsa);
    }
    /**
     * @override g.E#destroy
     */
    destroy() {
        if (this.destroyed()) {
            return;
        }
        if (!!this.fadeAsa) {
            this.fadeAsa.destroy();
            this.fadeAsa = null;
        }
        super.destroy();
    }
    /**
     * ワイプ演出を開始する
     * @param {boolean} _isRtoL trueならばRtoL、falseならばLtoRのアニメを使用する
     * @param {() => void} _funcMid 全画面が黒になった時点で呼ばれる関数
     * @param {() => void} _funcFinal ワイプ演出が終了した時点で呼ばれる関数
     */
    startWipe(_isRtoL, _funcMid, _funcFinal) {
        const animName = _isRtoL ?
            commonAsaInfo_1.CommonAsaInfo.nwCommon.anim.fadeRtoL :
            commonAsaInfo_1.CommonAsaInfo.nwCommon.anim.fadeLtoR;
        this.fadeAsa.play(animName, 0, false, 1.0);
        this.fadeAsa.pause = false;
        entityUtil_1.entityUtil.showEntity(this.fadeAsa);
        // ワイプアニメの黒幕移動部分のフレーム数
        const wipeFrames = 6;
        // 黒幕で完全に画面が隠れるまでのフレーム数
        const inFrames = (wipeFrames / 2) | 0;
        const outFrames = wipeFrames - inFrames;
        const timeline = this.scene.game.vars.scenedata.timeline;
        gameUtil_1.gameUtil.createTween(timeline, this.fadeAsa).
            every(() => {
            this.fadeAsa.modified();
            this.fadeAsa.calc();
        }, gameUtil_1.gameUtil.frame2MSec(inFrames)).
            call(() => {
            if (_funcMid) {
                _funcMid();
            }
        }).
            every(() => {
            this.fadeAsa.modified();
            this.fadeAsa.calc();
        }, gameUtil_1.gameUtil.frame2MSec(outFrames)).
            call(() => {
            this.fadeAsa.pause = true;
            entityUtil_1.entityUtil.hideEntity(this.fadeAsa);
            if (_funcFinal) {
                _funcFinal();
            }
        });
    }
}
exports.WipeManager = WipeManager;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
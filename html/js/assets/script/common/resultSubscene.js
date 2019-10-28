window.gLocalAssetContainer["resultSubscene"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commonAsaInfo_1 = require("./commonAsaInfo");
const commonAssetInfo_1 = require("./commonAssetInfo");
const commonSoundInfo_1 = require("./commonSoundInfo");
const commonDefine_1 = require("./commonDefine");
const asaEx_1 = require("../util/asaEx");
const spriteUtil_1 = require("../util/spriteUtil");
const entityUtil_1 = require("../util/entityUtil");
const gameUtil_1 = require("../util/gameUtil");
const audioUtil_1 = require("../util/audioUtil");
const subscene_1 = require("../commonNicowariGame/subscene");
/**
 * リザルトサブシーンの処理と表示を行うクラス
 */
class ResultSubscene extends subscene_1.Subscene {
    constructor(_scene) {
        super(_scene);
        /** tips画像リスト */
        this.tipsImgList = [];
    }
    /**
     * このクラスで使用するオブジェクトを生成する
     * @override
     */
    init() {
        this.requestedNextSubscene = new g.Trigger();
        const game = this.scene.game;
        if (commonDefine_1.commonDefine.SHOW_TIPS) {
            this.offsetY = 0;
            this.initTipsImgList();
        }
        else {
            this.offsetY = commonDefine_1.commonDefine.RESULT_OBJECTS_OFFSET_Y;
        }
        const result = this.asaResult =
            new asaEx_1.asaEx.Actor(this.scene, commonAsaInfo_1.CommonAsaInfo.nwCommon.pj);
        result.x = game.width / 2;
        result.y = (game.height / 2) + this.offsetY;
        result.update.handle(spriteUtil_1.spriteUtil.makeActorUpdater(result));
        result.hide();
        entityUtil_1.entityUtil.appendEntity(result, this);
        this.scoreValue = 0;
        const font = gameUtil_1.gameUtil.createNumFontWithAssetInfo(commonAssetInfo_1.CommonAssetInfo.numResult, this.scene.assets);
        const score = this.scoreLabel = entityUtil_1.entityUtil.createNumLabel(this.scene, font, commonDefine_1.commonDefine.RESULT_SCORE_DIGIT);
        entityUtil_1.entityUtil.moveNumLabelTo(score, 320 + ((game.width - 480) / 2), 84 + this.offsetY);
        score.hide();
        entityUtil_1.entityUtil.appendEntity(score, this);
        this.isRolling = false;
        entityUtil_1.entityUtil.hideEntity(this);
    }
    /**
     * 表示系以外のオブジェクトをdestroyする
     * 表示系のオブジェクトはg.Eのdestroyに任せる
     * @override
     */
    destroy() {
        if (this.destroyed()) {
            return;
        }
        if (this.requestedNextSubscene) {
            this.requestedNextSubscene.destroy();
            this.requestedNextSubscene = null;
        }
        super.destroy();
    }
    /**
     * 表示を開始する
     * このサブシーンに遷移するワイプ演出で表示が始まる時点で呼ばれる
     * @override
     */
    showContent() {
        this.scoreValue = gameUtil_1.gameUtil.getGameScore();
        this.scoreLabel.hide();
        entityUtil_1.entityUtil.showEntity(this);
    }
    /**
     * 動作を開始する
     * このサブシーンに遷移するワイプ演出が完了した時点で呼ばれる
     * @override
     */
    startContent() {
        this.asaResult.play(commonAsaInfo_1.CommonAsaInfo.nwCommon.anim.result, 0, false, 1);
        this.createTips();
        audioUtil_1.audioUtil.play(commonSoundInfo_1.CommonSoundInfo.seSet.rollResult);
        this.isRolling = true;
        this.setScoreLabelText();
        entityUtil_1.entityUtil.showEntity(this.scoreLabel);
        entityUtil_1.entityUtil.showEntity(this.asaResult);
        this.scene.setTimeout(commonDefine_1.commonDefine.RESULT_ROLL_WAIT, this, this.onRollEnd);
    }
    /**
     * Scene#updateを起点とする処理から呼ばれる
     * @override
     */
    onUpdate() {
        if (this.isRolling) {
            this.setScoreLabelText();
        }
    }
    /**
     * 動作を停止する
     * このサブシーンから遷移するワイプ演出が始まる時点で呼ばれる
     * @override
     */
    stopContent() {
        // NOP
    }
    /**
     * 表示を終了する
     * このサブシーンから遷移するワイプ演出で表示が終わる時点で呼ばれる
     * @override
     */
    hideContent() {
        entityUtil_1.entityUtil.hideEntity(this);
        entityUtil_1.entityUtil.hideEntity(this.asaResult);
    }
    /**
     * スコアラベルを設定する
     */
    setScoreLabelText() {
        let value = this.scoreValue;
        const len = String(value).length;
        if (this.isRolling) { // 回転中はスコア桁内でランダム
            value = this.scene.game.random[0].get(Math.pow(10, len - 1), Math.pow(10, len) - 1);
        }
        entityUtil_1.entityUtil.setLabelText(this.scoreLabel, String(value));
    }
    /**
     * Scene#setTimeoutのハンドラ
     * ロール演出の終了時用
     */
    onRollEnd() {
        audioUtil_1.audioUtil.stop(commonSoundInfo_1.CommonSoundInfo.seSet.rollResult);
        audioUtil_1.audioUtil.play(commonSoundInfo_1.CommonSoundInfo.seSet.rollResultFinish);
        this.isRolling = false;
        this.setScoreLabelText();
        if (commonDefine_1.commonDefine.ENABLE_RETRY) {
            // リトライ操作を受け付ける場合
            this.scene.pointDownCapture.handle(this, this.onTouch);
        }
    }
    /**
     * Scene#pointDownCaptureのハンドラ
     * 次のシーンへの遷移を要求する
     * @param {g.PointDownEvent} _e イベントパラメータ
     * @return {boolean} trueを返し、ハンドラ登録を解除する
     */
    onTouch(_e) {
        this.requestedNextSubscene.fire();
        return true;
    }
    /**
     * tips画像を作成する
     */
    createTips() {
        if (this.tipsImgList.length === 0)
            return;
        const randIndex = gameUtil_1.gameUtil.getRandomLessThanMax(this.tipsImgList.length);
        const asset = this.tipsImgList[randIndex];
        const size = commonDefine_1.commonDefine.TIPS_IMG_SIZE;
        const spr = new g.Sprite({ scene: this.scene, src: this.scene.assets[asset], width: size.width, height: size.height });
        spr.moveTo(commonDefine_1.commonDefine.TIPS_IMG_POS);
        entityUtil_1.entityUtil.appendEntity(spr, this);
    }
    /**
     * CommonAssetInfoからtips画像アセットをリスト化する
     */
    initTipsImgList() {
        this.tipsImgList = [];
        const wk = commonAssetInfo_1.CommonAssetInfo;
        Object.keys(wk).filter((e) => {
            return (e.indexOf(commonDefine_1.commonDefine.TIPS_VAR_NAME_HEAD) === 0); // commonDefine.TIPS_VAR_NAME_HEADで始まるオブジェクト
        }).forEach((val) => {
            const info = wk[val];
            // console.log(info.img);
            this.tipsImgList.push(info.img);
        });
    }
}
exports.ResultSubscene = ResultSubscene;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
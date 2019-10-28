window.gLocalAssetContainer["timerLabel"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commonDefine_1 = require("../common/commonDefine");
const entityUtil_1 = require("../util/entityUtil");
const gameUtil_1 = require("../util/gameUtil");
const define_1 = require("./define");
/**
 * 残り時間の管理、表示を行うクラス
 * 残り時間警告の演出も管理する。
 */
class TimerLabel extends g.E {
    constructor(_scene) {
        super({ scene: _scene });
        this.timeCaution = new g.Trigger();
        this.timeCautionCancel = new g.Trigger();
    }
    /**
     * 表示系以外のオブジェクトをdestroyするメソッド
     * 表示系のオブジェクトはg.Eのdestroyに任せる。
     * @override
     */
    destroy() {
        if (this.destroyed()) {
            return;
        }
        if (this.timeCaution) {
            this.timeCaution.destroy();
            this.timeCaution = null;
        }
        if (this.timeCautionCancel) {
            this.timeCautionCancel.destroy();
            this.timeCautionCancel = null;
        }
        super.destroy();
    }
    /**
     * フォントのアセット情報を渡してラベルを生成するメソッド
     * @param {AssetInfoType} _numBlackInfo 黒文字のアセット情報
     * @param {AssetInfoType} _numRedInfo 赤文字のアセット情報
     */
    createLabel(_numBlackInfo, _numRedInfo) {
        this.remainFrameCount = 0;
        this.currentCount = 0;
        const fontBlack = gameUtil_1.gameUtil.createNumFontWithAssetInfo(_numBlackInfo);
        const labelBlack = this.labelBlack = entityUtil_1.entityUtil.createNumLabel(this.scene, fontBlack, define_1.define.GAME_TIMER_DIGIT);
        entityUtil_1.entityUtil.appendEntity(labelBlack, this);
        const scaleLayer = this.scaleLayer = new g.E({ scene: this.scene });
        entityUtil_1.entityUtil.appendEntity(scaleLayer, this);
        const fontRed = gameUtil_1.gameUtil.createNumFontWithAssetInfo(_numRedInfo);
        const labelRed = this.labelRed = entityUtil_1.entityUtil.createNumLabel(this.scene, fontRed, define_1.define.GAME_TIMER_DIGIT);
        entityUtil_1.entityUtil.appendEntity(labelRed, scaleLayer);
        this.stopBlink();
    }
    /**
     * 右端の数字の左上を指定してラベルの位置を設定するメソッド
     * @param {number} _x 右端の数字の左上のx座標
     * @param {number} _y 右端の数字の左上のy座標
     */
    moveLabelTo(_x, _y) {
        if (!this.labelBlack) {
            return;
        }
        // 点滅時の拡大基準点
        const label = this.labelBlack;
        // const font = label.font;
        const pivotX = _x + (label.width / 2);
        const pivotY = _y + (label.height / 2);
        entityUtil_1.entityUtil.setXY(this.scaleLayer, pivotX, pivotY);
        // ラベルの左上
        const labelX = _x + -label.width;
        const labelY = _y;
        entityUtil_1.entityUtil.setXY(this.labelBlack, labelX, labelY);
        entityUtil_1.entityUtil.setXY(this.labelRed, labelX - pivotX, labelY - pivotY);
    }
    /**
     * 現在の残り秒数を設定するメソッド
     * @param {number} _seconds 設定する値
     */
    setTimeCount(_seconds) {
        this.setTimeFrameCount(gameUtil_1.gameUtil.sec2Frame(_seconds));
    }
    /**
     * 現在の残り秒数をフレーム数で設定するメソッド
     * @param {number} _frames 設定する値
     */
    setTimeFrameCount(_frames) {
        this.remainFrameCount = _frames;
        this.renewCurrentNumber(true);
    }
    /**
     * 現在の残り秒数を取得するメソッド（小数部は切り上げる）
     * @return {number} 秒数
     */
    getTimeCount() {
        return Math.ceil(gameUtil_1.gameUtil.frame2Sec(this.remainFrameCount));
    }
    /**
     * 現在の残り秒数を取得するメソッド（小数部あり）
     * @return {number} 秒数
     */
    getTimeCountReal() {
        return gameUtil_1.gameUtil.frame2Sec(this.remainFrameCount);
    }
    /**
     * 現在の残り秒数をフレーム数で取得するメソッド
     * @return {number} フレーム数
     */
    getTimeFrameCount() {
        return this.remainFrameCount;
    }
    /**
     * 点滅状態を取得するメソッド
     * @return {boolean} 点滅中ならばtrue
     */
    isBlinking() {
        return this.isBlinking_;
    }
    /**
     * 1フレーム分時間を進めるメソッド
     */
    tick() {
        if (this.remainFrameCount > 0) {
            --this.remainFrameCount;
            // remainFrameCountの値が小数である場合を考慮した条件
            if (this.remainFrameCount < 0) {
                this.remainFrameCount = 0;
            }
            this.renewCurrentNumber();
        }
    }
    /**
     * 残り時間によらず赤点滅演出を終了するメソッド
     */
    forceStopBlink() {
        if (this.isBlinking_) {
            this.stopBlink();
        }
    }
    /**
     * 残り時間表示の更新を行うメソッド
     * opt_isForceがtrueでなければ現在の表示内容と変化がある場合のみ
     * ラベル内容を設定する
     * @param {boolean = false} opt_isForce (optional)強制設定フラグ
     */
    renewCurrentNumber(opt_isForce = false) {
        const seconds = this.getTimeCount();
        if (opt_isForce || (seconds !== this.currentCount)) {
            const text = String(seconds);
            entityUtil_1.entityUtil.setLabelText(this.labelBlack, text);
            entityUtil_1.entityUtil.setLabelText(this.labelRed, text);
            this.currentCount = seconds;
            this.checkBlinkState();
        }
    }
    /**
     * 赤点滅状態を確認、更新するメソッド
     */
    checkBlinkState() {
        if ((this.currentCount > 0) &&
            (this.currentCount < define_1.define.CAUTION_TIME_CONDITION)) {
            if (!this.isBlinking_) {
                this.startBlink();
            }
        }
        else {
            if (this.isBlinking_) {
                this.stopBlink();
            }
        }
    }
    /**
     * 赤点滅演出を開始するメソッド
     */
    startBlink() {
        this.isBlinking_ = true;
        this.setTween();
        entityUtil_1.entityUtil.hideEntity(this.labelBlack);
        entityUtil_1.entityUtil.showEntity(this.labelRed);
        this.timeCaution.fire();
    }
    /**
     * 赤点滅演出を終了するメソッド
     */
    stopBlink() {
        this.isBlinking_ = false;
        entityUtil_1.entityUtil.hideEntity(this.labelRed);
        entityUtil_1.entityUtil.showEntity(this.labelBlack);
        this.timeCautionCancel.fire();
        // stopBlinkのあと実行中のtweenが終了する前にstartBlinkされると
        // 正常に動かないが仕様上起きない前提とする。
    }
    /**
     * 赤点滅一周期分のtweenを設定するメソッド
     */
    setTween() {
        const scaleOff = commonDefine_1.commonDefine.CAUTION_TIME_SCALE_OFF;
        const scaleOn = commonDefine_1.commonDefine.CAUTION_TIME_SCALE_ON;
        entityUtil_1.entityUtil.setScale(this.scaleLayer, scaleOff);
        const timeline = this.scene.game.vars.scenedata.timeline;
        gameUtil_1.gameUtil.createTween(timeline, this.scaleLayer).
            to({ scaleX: scaleOn, scaleY: scaleOn }, gameUtil_1.gameUtil.frame2MSec(commonDefine_1.commonDefine.CAUTION_TIME_ON)).
            to({ scaleX: scaleOff, scaleY: scaleOff }, gameUtil_1.gameUtil.frame2MSec(commonDefine_1.commonDefine.CAUTION_TIME_OFF)).
            call(() => {
            if (this.isBlinking_) {
                this.setTween();
            }
        });
    }
}
exports.TimerLabel = TimerLabel;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
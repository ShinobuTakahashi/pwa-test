window.gLocalAssetContainer["gameSubscene"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscene_1 = require("../commonNicowariGame/subscene");
const commonAsaInfo_1 = require("./commonAsaInfo");
const commonSoundInfo_1 = require("./commonSoundInfo");
const commonDefine_1 = require("./commonDefine");
const asaEx_1 = require("../util/asaEx");
const spriteUtil_1 = require("../util/spriteUtil");
const entityUtil_1 = require("../util/entityUtil");
const audioUtil_1 = require("../util/audioUtil");
const cautionFilledRect_1 = require("./cautionFilledRect");
const gameCreator_1 = require("../classes/gameCreator");
/**
 * ゲームサブシーンの処理と表示を行うクラス
 */
class GameSubscene extends subscene_1.Subscene {
    constructor(_scene) {
        super(_scene);
    }
    /**
     * このクラスで使用するオブジェクトを生成する
     * @override
     */
    init() {
        this.requestedNextSubscene = new g.Trigger();
        const game = this.scene.game;
        const cautionFill = this.cautionFill = new cautionFilledRect_1.CautionFilledRect(this.scene);
        entityUtil_1.entityUtil.appendEntity(cautionFill, this);
        this.inPreGameGuide = false;
        const content = this.gameContent = gameCreator_1.GameCreator.createGame(this.scene);
        content.init();
        entityUtil_1.entityUtil.appendEntity(content, this);
        const jingle = this.asaJingle =
            new asaEx_1.asaEx.Actor(this.scene, commonAsaInfo_1.CommonAsaInfo.nwCommon.pj);
        jingle.x = game.width / 2;
        jingle.y = game.height / 2;
        jingle.update.handle(spriteUtil_1.spriteUtil.makeActorUpdater(jingle));
        jingle.hide();
        entityUtil_1.entityUtil.appendEntity(jingle, this);
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
     * タイトル画面のBGMのアセット名を返すメソッド
     * @return {string} アセット名
     */
    getTitleBgmName() {
        return this.gameContent.getTitleBgmName();
    }
    /**
     * 表示を開始する
     * このサブシーンに遷移するワイプ演出で表示が始まる時点で呼ばれる
     * @override
     */
    showContent() {
        this.gameContent.showContent();
        entityUtil_1.entityUtil.showEntity(this.gameContent);
        entityUtil_1.entityUtil.showEntity(this);
    }
    /**
     * 動作を開始する
     * このサブシーンに遷移するワイプ演出が完了した時点で呼ばれる
     * @override
     */
    startContent() {
        this.inPreGameGuide = this.gameContent.startPreGameGuide();
        if (!this.inPreGameGuide) {
            this.startReady();
        }
    }
    /**
     * Scene#updateを起点とする処理から呼ばれる
     * @override
     */
    onUpdate() {
        if (this.inPreGameGuide) {
            if (this.gameContent.onUpdatePreGameGuide()) {
                this.inPreGameGuide = false;
                this.startReady();
            }
        }
        this.gameContent.onUpdate();
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
        entityUtil_1.entityUtil.hideEntity(this.asaJingle);
        entityUtil_1.entityUtil.hideEntity(this.gameContent);
        this.gameContent.hideContent();
    }
    /**
     * ReadyGoジングルを開始する
     */
    startReady() {
        if (this.gameContent.needsReadyGoJingle()) {
            this.asaJingle.play(commonAsaInfo_1.CommonAsaInfo.nwCommon.anim.readyGo, 0, false, 1);
            this.asaJingle.ended.handle(this, this.onReadyEnd);
            entityUtil_1.entityUtil.showEntity(this.asaJingle);
            audioUtil_1.audioUtil.play(commonSoundInfo_1.CommonSoundInfo.seSet.ready);
        }
        else {
            this.startGame();
        }
    }
    /**
     * Actor#endedのハンドラ
     * ReadyGoアニメの終了時用
     * @return {boolean} trueを返し、ハンドラ登録を解除する
     */
    onReadyEnd() {
        entityUtil_1.entityUtil.hideEntity(this.asaJingle);
        this.startGame();
        return true;
    }
    /**
     * ゲームを開始する
     */
    startGame() {
        audioUtil_1.audioUtil.play(this.gameContent.getMainBgmName());
        this.gameContent.timeCaution.handle(this, this.onTimeCaution);
        this.gameContent.timeCautionCancel.handle(this, this.onTimeCautionCancel);
        this.gameContent.timeup.handle(this, this.onTimeup);
        this.gameContent.timeout.handle(this, this.onTimeout);
        this.gameContent.gameClear.handle(this, this.onGameClear);
        this.gameContent.gameOver.handle(this, this.onGameOver);
        this.gameContent.startGame();
    }
    /**
     * GaemBase#timeCautionのハンドラ
     * 残り時間警告の赤点滅を開始する
     */
    onTimeCaution() {
        this.cautionFill.startBlink();
    }
    /**
     * GaemBase#timeCautionCancelのハンドラ
     * 残り時間警告の赤点滅を中断する
     */
    onTimeCautionCancel() {
        this.cautionFill.stopBlink();
    }
    /**
     * GaemBase#timeupのハンドラ
     * タイムアップ演出を開始する
     * @return {boolean} trueを返し、ハンドラ登録を解除する
     */
    onTimeup() {
        this.finishGame(commonAsaInfo_1.CommonAsaInfo.nwCommon.anim.timeup);
        return true;
    }
    /**
     * GaemBase#timeoutのハンドラ
     * タイムアウト演出を開始する
     * @return {boolean} trueを返し、ハンドラ登録を解除する
     */
    onTimeout() {
        this.finishGame(commonAsaInfo_1.CommonAsaInfo.nwCommon.anim.timeout);
        return true;
    }
    /**
     * GaemBase#gameClearのハンドラ
     * ゲームクリア演出を開始する
     * @return {boolean} trueを返し、ハンドラ登録を解除する
     */
    onGameClear() {
        this.finishGame(commonAsaInfo_1.CommonAsaInfo.nwCommon.anim.gameClear);
        return true;
    }
    /**
     * GaemBase#gameOverのハンドラ
     * ゲームオーバー演出を開始する
     * @return {boolean} trueを返し、ハンドラ登録を解除する
     */
    onGameOver() {
        this.finishGame(commonAsaInfo_1.CommonAsaInfo.nwCommon.anim.gameOver);
        return true;
    }
    /**
     * タイムアップ/タイムアウト/ゲームクリア/ゲームオーバー時の処理を行う
     * @param {string} _jingleAnimName ジングルアニメ名
     */
    finishGame(_jingleAnimName) {
        audioUtil_1.audioUtil.stop(this.gameContent.getMainBgmName());
        this.cautionFill.stopBlink();
        this.gameContent.timeCaution.removeAll();
        this.gameContent.timeCautionCancel.removeAll();
        this.gameContent.timeup.removeAll();
        this.gameContent.timeout.removeAll();
        this.gameContent.gameClear.removeAll();
        this.gameContent.gameOver.removeAll();
        this.asaJingle.play(_jingleAnimName, 0, false, 1, true);
        entityUtil_1.entityUtil.showEntity(this.asaJingle);
        audioUtil_1.audioUtil.play(commonSoundInfo_1.CommonSoundInfo.seSet.timeup);
        this.scene.setTimeout(commonDefine_1.commonDefine.TIMEUP_WAIT, this, this.onTimeupEnd);
    }
    /**
     * Scene#setTimeoutのハンドラ
     * Timeup演出の終了時用
     * 次のシーンへの遷移を要求する
     */
    onTimeupEnd() {
        this.requestedNextSubscene.fire();
    }
}
exports.GameSubscene = GameSubscene;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
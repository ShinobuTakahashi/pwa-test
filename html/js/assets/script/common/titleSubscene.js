window.gLocalAssetContainer["titleSubscene"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscene_1 = require("../commonNicowariGame/subscene");
const commonAsaInfo_1 = require("./commonAsaInfo");
const asaEx_1 = require("../util/asaEx");
const spriteUtil_1 = require("../util/spriteUtil");
const entityUtil_1 = require("../util/entityUtil");
const audioUtil_1 = require("../util/audioUtil");
const commonDefine_1 = require("./commonDefine");
/**
 * タイトルサブシーンの処理と表示を行うクラス
 */
class TitleSubscene extends subscene_1.Subscene {
    constructor(_scene) {
        super(_scene);
    }
    /**
     * このクラスで使用するオブジェクトを生成する
     * @override
     */
    init() {
        this.autoNext = (commonDefine_1.commonDefine.TITLE_WAIT > 0);
        this.inContent = false;
        this.bgmName = "";
        this.requestedNextSubscene = new g.Trigger();
        const game = this.scene.game;
        const title = this.asaTitle =
            new asaEx_1.asaEx.Actor(this.scene, commonAsaInfo_1.CommonAsaInfo.nwTitle.pj);
        title.x = game.width / 2;
        title.y = game.height / 2;
        title.update.handle(spriteUtil_1.spriteUtil.makeActorUpdater(title));
        title.hide();
        entityUtil_1.entityUtil.appendEntity(title, this);
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
     * タイトル画面のBGMのアセット名を設定するメソッド
     * @param {string} _bgmName タイトル画面のBGMのアセット名
     */
    setBgmName(_bgmName) {
        this.bgmName = _bgmName;
    }
    /**
     * 表示を開始する
     * このサブシーンに遷移するワイプ演出で表示が始まる時点で呼ばれる
     * @override
     */
    showContent() {
        audioUtil_1.audioUtil.play(this.bgmName);
        entityUtil_1.entityUtil.showEntity(this);
    }
    /**
     * 動作を開始する
     * このサブシーンに遷移するワイプ演出が完了した時点で呼ばれる
     * @override
     */
    startContent() {
        this.inContent = true;
        this.asaTitle.play(commonAsaInfo_1.CommonAsaInfo.nwTitle.anim.title, 0, false, 1);
        entityUtil_1.entityUtil.showEntity(this.asaTitle);
        if (this.autoNext) {
            this.scene.setTimeout(commonDefine_1.commonDefine.TITLE_WAIT, this, this.onTimeout);
            if (commonDefine_1.commonDefine.TOUCH_SKIP_WAIT > 0) {
                this.scene.setTimeout(commonDefine_1.commonDefine.TOUCH_SKIP_WAIT, this, this.onTimeoutToTouch);
            }
        }
        else {
            this.asaTitle.ended.handle(this, this.onTitleEnd);
        }
    }
    /**
     * Scene#updateを起点とする処理から呼ばれる
     * @override
     */
    onUpdate() {
        // NOP
    }
    /**
     * 動作を停止する
     * このサブシーンから遷移するワイプ演出が始まる時点で呼ばれる
     * @override
     */
    stopContent() {
        // console.log("TitleSubscene.stopContent: inContent:"+this.inContent+".");
        this.inContent = false;
        this.scene.pointDownCapture.removeAll();
    }
    /**
     * 表示を終了する
     * このサブシーンから遷移するワイプ演出で表示が終わる時点で呼ばれる
     * @override
     */
    hideContent() {
        audioUtil_1.audioUtil.stop(this.bgmName);
        entityUtil_1.entityUtil.hideEntity(this);
        entityUtil_1.entityUtil.hideEntity(this.asaTitle);
    }
    /**
     * Scene#setTimeoutのハンドラ
     * 次のシーンへの遷移を要求する
     */
    onTimeout() {
        // console.log("TitleSubscene.onTimeout: inContent:"+this.inContent+".");
        if (this.inContent) {
            this.requestedNextSubscene.fire();
        }
    }
    /**
     * Scene#setTimeoutのハンドラ
     * タッチ受付を開始する
     */
    onTimeoutToTouch() {
        // console.log("TitleSubscene.onTimeoutToTouch: inContent:"+this.inContent+".");
        if (this.inContent) {
            this.scene.pointDownCapture.handle(this, this.onTouch);
        }
    }
    /**
     * Actor#endedのハンドラ
     * タイトルロゴアニメの終了時用
     * @return {boolean} trueを返し、ハンドラ登録を解除する
     */
    onTitleEnd() {
        if (this.inContent) {
            this.scene.pointDownCapture.handle(this, this.onTouch);
        }
        return true;
    }
    /**
     * Scene#pointDownCaptureのハンドラ
     * 次のシーンへの遷移を要求する
     * @param {g.PointDownEvent} e イベントパラメータ
     * @return {boolean} trueを返し、ハンドラ登録を解除する
     */
    onTouch(_e) {
        // console.log("TitleSubscene.onTouch: inContent:"+this.inContent+".");
        if (this.inContent) {
            this.requestedNextSubscene.fire();
        }
        return true;
    }
}
exports.TitleSubscene = TitleSubscene;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
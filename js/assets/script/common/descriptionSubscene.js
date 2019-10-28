window.gLocalAssetContainer["descriptionSubscene"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscene_1 = require("../commonNicowariGame/subscene");
const commonAsaInfo_1 = require("./commonAsaInfo");
const asaEx_1 = require("../util/asaEx");
const spriteUtil_1 = require("../util/spriteUtil");
const entityUtil_1 = require("../util/entityUtil");
const commonDefine_1 = require("./commonDefine");
/**
 * 説明文言サブシーンの処理と表示を行うクラス
 */
class DescriptionSubscene extends subscene_1.Subscene {
    constructor(_scene) {
        super(_scene);
    }
    /**
     * このクラスで使用するオブジェクトを生成する
     * @override
     */
    init() {
        this.autoNext = (commonDefine_1.commonDefine.DESCRIPTION_WAIT > 0);
        this.inContent = false;
        this.requestedNextSubscene = new g.Trigger();
        const game = this.scene.game;
        const desc = this.asaDescription =
            new asaEx_1.asaEx.Actor(this.scene, commonAsaInfo_1.CommonAsaInfo.nwTitle.pj);
        desc.x = game.width / 2;
        desc.y = game.height / 2;
        desc.update.handle(spriteUtil_1.spriteUtil.makeActorUpdater(desc));
        desc.hide();
        entityUtil_1.entityUtil.appendEntity(desc, this);
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
        this.asaDescription.play(commonAsaInfo_1.CommonAsaInfo.nwTitle.anim.description, 0, false, 1);
        entityUtil_1.entityUtil.showEntity(this.asaDescription);
        entityUtil_1.entityUtil.showEntity(this);
    }
    /**
     * 動作を開始する
     * このサブシーンに遷移するワイプ演出が完了した時点で呼ばれる
     * @override
     */
    startContent() {
        this.inContent = true;
        if (this.autoNext) {
            this.scene.setTimeout(commonDefine_1.commonDefine.DESCRIPTION_WAIT, this, this.onTimeout);
            if (commonDefine_1.commonDefine.TOUCH_SKIP_WAIT > 0) {
                this.scene.setTimeout(commonDefine_1.commonDefine.TOUCH_SKIP_WAIT, this, this.onTimeoutToTouch);
            }
        }
        else {
            this.scene.pointDownCapture.handle(this, this.onTouch);
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
        // console.log("DescriptionSubscene.stopContent: inContent:"+this.inContent+".");
        this.inContent = false;
        this.scene.pointDownCapture.removeAll();
    }
    /**
     * 表示を終了する
     * このサブシーンから遷移するワイプ演出で表示が終わる時点で呼ばれる
     * @override
     */
    hideContent() {
        entityUtil_1.entityUtil.hideEntity(this);
        entityUtil_1.entityUtil.hideEntity(this.asaDescription);
    }
    /**
     * Scene#setTimeoutのハンドラ
     * 次のシーンへの遷移を要求する
     */
    onTimeout() {
        // console.log("DescriptionSubscene.onTimeout: inContent:"+this.inContent+".");
        if (this.inContent) {
            this.requestedNextSubscene.fire();
        }
    }
    /**
     * Scene#setTimeoutのハンドラ
     * タッチ受付を開始する
     */
    onTimeoutToTouch() {
        // console.log("DescriptionSubscene.onTimeoutToTouch: inContent:"+this.inContent+".");
        if (this.inContent) {
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
        // console.log("DescriptionSubscene.onTouch: inContent:"+this.inContent+".");
        if (this.inContent) {
            this.requestedNextSubscene.fire();
        }
        return true;
    }
}
exports.DescriptionSubscene = DescriptionSubscene;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
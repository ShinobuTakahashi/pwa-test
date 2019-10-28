window.gLocalAssetContainer["gameBase"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entityUtil_1 = require("../util/entityUtil");
/**
 * ゲームの実体を実装するベースクラス
 */
class GameBase extends g.E {
    constructor(_scene) {
        super({ scene: _scene });
    }
    /**
     * このクラスで使用するオブジェクトを生成するメソッド
     * Scene#loadedを起点とする処理からコンストラクタの直後に呼ばれる。
     * このクラスはゲーム画面終了時も破棄されず、次のゲームで再利用される。
     * そのためゲーム状態の初期化はinitではなくshowContentで行う必要がある。
     */
    init() {
        this.timeCaution = new g.Trigger();
        this.timeCautionCancel = new g.Trigger();
        this.timeup = new g.Trigger();
        this.timeout = new g.Trigger();
        this.gameClear = new g.Trigger();
        this.gameOver = new g.Trigger();
        entityUtil_1.entityUtil.hideEntity(this);
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
        if (this.timeup) {
            this.timeup.destroy();
            this.timeup = null;
        }
        if (this.timeout) {
            this.timeout.destroy();
            this.timeout = null;
        }
        if (this.gameClear) {
            this.gameClear.destroy();
            this.gameClear = null;
        }
        if (this.gameOver) {
            this.gameOver.destroy();
            this.gameOver = null;
        }
        super.destroy();
    }
    /**
     * タイトル画面のBGMのアセット名を返すメソッド
     * 共通フロー側でBGMを鳴らさない場合は実装クラスでオーバーライドして
     * 空文字列を返すようにする
     * @return {string} アセット名
     */
    getTitleBgmName() {
        return "";
    }
    /**
     * ゲーム中のBGMのアセット名を返すメソッド
     * 共通フロー側でBGMを鳴らさない場合は実装クラスでオーバーライドして
     * 空文字列を返すようにする
     * @return {string} アセット名
     */
    getMainBgmName() {
        return "";
    }
    /**
     * 表示を開始するメソッド
     * ゲーム画面に遷移するワイプ演出で表示が始まる時点で呼ばれる。
     */
    showContent() {
        entityUtil_1.entityUtil.showEntity(this);
    }
    /**
     * ゲーム前ガイド表示を開始するメソッド
     * ゲーム画面に遷移したあとReady～Startジングルの前に呼ばれ、
     * ゲーム前ガイド表示を開始する。
     * ゲーム前ガイド表示を行わない場合はfalseを返す。
     * trueを返すとonUpdatePreGameGuideが呼ばれるようになる。
     * @return {boolean} ゲーム前ガイド表示を行わない場合はfalse
     */
    startPreGameGuide() {
        return false;
    }
    /**
     * ゲーム開始前のReadyGoジングル表示を行うかどうかを返すメソッド
     * ReadyGoジングル表示を行わない場合は実装クラスでこのメソッドを
     * オーバーライドしてfalseを返す
     * @return {boolean} ReadyGoジングル表示を行う場合はtrue
     */
    needsReadyGoJingle() {
        return true;
    }
    /**
     * 表示を終了するメソッド
     * このサブシーンから遷移するワイプ演出で表示が終わる時点で呼ばれる。
     */
    hideContent() {
        entityUtil_1.entityUtil.hideEntity(this);
    }
    /**
     * Scene#updateを起点とする処理から呼ばれるメソッド
     * startPreGameGuideでtrueを返した場合に呼ばれ始め、
     * この関数でtrueを返すと呼び出しが止まるとともに
     * Ready～Startジングルが開始される。
     * @return {boolean} ゲーム前ガイド表示を終了する場合はtrue
     */
    onUpdatePreGameGuide() {
        return true;
    }
}
exports.GameBase = GameBase;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
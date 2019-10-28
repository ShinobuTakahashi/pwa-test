window.gLocalAssetContainer["combo"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asaEx_1 = require("../util/asaEx");
const entityUtil_1 = require("../util/entityUtil");
/**
 * コンボエフェクトクラス
 */
class Combo {
    /**
     * 初期値の設定
     * @param  {g.Scene}        _scene     シーン
     * @param  {g.E}            _parent    親エンティティ
     * @param  {g.BitmapFont}   _font      コンボフォント
     * @param  {string}         _asaPjName コンボASAのpj
     * @param  {string}         _animName  コンボアニメ名
     * @param  {g.CommonOffset} _pos       アニメ位置
     * @param  {number}         _digit     コンボ桁
     * @param  {number}         _divisor   コンボ倍率除数
     * @param  {string}         _pivot     コンボアタッチピボット
     */
    constructor(_scene, _parent, _font, _asaPjName, _animName, _pos, _digit, _divisor, _pivot) {
        /** 属するシーン */
        this.scene = null;
        /** 現在のコンボ数 */
        this.comboNum = 0;
        this.scene = _scene;
        this.animName = _animName;
        this.divisor = _divisor;
        let defaultText = "";
        for (; _digit > defaultText.length; defaultText += "0")
            ; // コンボ用ラベル初期テキスト作成
        // コンボ用ラベル3桁左よせ
        this.label = entityUtil_1.entityUtil.createLabel(this.scene, defaultText, _font, _digit, g.TextAlign.Left);
        this.label.update.handle(() => {
            entityUtil_1.entityUtil.setLabelText(this.label, String(this.comboNum));
        });
        // コンボアニメ
        this.actor = new asaEx_1.asaEx.Actor(this.scene, _asaPjName, _animName);
        this.actor.moveTo(_pos);
        this.actor.pause = true;
        entityUtil_1.entityUtil.hideEntity(this.actor);
        entityUtil_1.entityUtil.appendEntity(this.actor, _parent);
        // アタッチメントを作成
        const attachCombo = new asaEx_1.asaEx.EntityAttachment(this.label);
        this.actor.attach(attachCombo, _pivot); // コンボアニメにラベルをアタッチ
        this.actor.update.handle(this.actor, () => {
            this.actor.modified();
            this.actor.calc();
            return false;
        });
    }
    /**
     *  ゲーム毎の初期化
     */
    init() {
        this.comboNum = 0;
        entityUtil_1.entityUtil.hideEntity(this.actor);
    }
    /**
     * コンボスコアを取得
     * コンボの増減も実施
     * @param  {number} _value 計算するスコア
     * @return {number}        コンボスコア
     */
    getComboValue(_value) {
        if (_value < 0) { // マイナスの場合
            entityUtil_1.entityUtil.hideEntity(this.actor);
            this.comboNum = 0;
            return _value;
        }
        else {
            this.comboNum += 1;
            return this.calcComboValue(_value); // キルカウントからコンボスコアを計算
        }
    }
    /**
     * コンボアニメを再生
     */
    playComboAnim() {
        if (this.comboNum >= 2) {
            entityUtil_1.entityUtil.showEntity(this.actor);
            this.actor.play(this.animName, 0, false, 1.0);
        }
    }
    /**
     * コンボ計算
     * @param  {number} _plusScore スコア
     * @return {number}            コンボ倍率を掛けたスコアを四捨五入したもの
     */
    calcComboValue(_plusScore) {
        // 倍率 コンボ1 = 1 + (1-1 / 倍率除数)、コンボ2 = 1 + (2-1 / 倍率除数)、コンボ3 = 1 + (3-1 / 倍率除数)...
        const scale = 1 + ((this.comboNum - 1) / this.divisor);
        return Math.round(_plusScore * scale); // 四捨五入
    }
}
exports.Combo = Combo;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
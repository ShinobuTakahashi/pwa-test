window.gLocalAssetContainer["bullet"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asaEx_1 = require("../util/asaEx");
const entityUtil_1 = require("../util/entityUtil");
const asaInfo_1 = require("./asaInfo");
const define_1 = require("./define");
/**
 * 弾管理クラス
 */
class Bullet {
    /**
     * パラメータに応じた弾の生成
     * @param  {g.Scene}            _scene  シーン
     * @param  {g.E}                _parent 親エンティティ
     * @param  {define.BulletLevel} _level  弾レベル
     * @param  {g.CommonOffset}     _pos    生成座標
     */
    constructor(_scene, _parent, _level, _pos) {
        /** 弾 */
        this.spr = null;
        /** 弾耐久値 */
        this.life = null;
        /** 弾速 */
        this.moveX = define_1.define.BULLET_MOVE_X;
        /** コンボ */
        this.kill = 0;
        let animeName;
        let size;
        switch (_level) { // ワークマンのレベルから弾の種類を決定
            case define_1.define.BulletLevel.nail:
                animeName = asaInfo_1.AsaInfo.bullet.anim.weapon01;
                size = { width: asaInfo_1.AsaInfo.bullet.w01, height: asaInfo_1.AsaInfo.bullet.h01 };
                break;
            case define_1.define.BulletLevel.screwDriver:
                animeName = asaInfo_1.AsaInfo.bullet.anim.weapon02;
                size = { width: asaInfo_1.AsaInfo.bullet.w02, height: asaInfo_1.AsaInfo.bullet.h02 };
                break;
            case define_1.define.BulletLevel.spanner:
                animeName = asaInfo_1.AsaInfo.bullet.anim.weapon03;
                size = { width: asaInfo_1.AsaInfo.bullet.w03, height: asaInfo_1.AsaInfo.bullet.h03 };
                break;
            case define_1.define.BulletLevel.hammer:
                animeName = asaInfo_1.AsaInfo.bullet.anim.weapon04;
                size = { width: asaInfo_1.AsaInfo.bullet.w04, height: asaInfo_1.AsaInfo.bullet.h04 };
                break;
            default:
                animeName = asaInfo_1.AsaInfo.bullet.anim.weapon01;
                break;
        }
        this.spr = new asaEx_1.asaEx.Actor(_scene, asaInfo_1.AsaInfo.bullet.pj, animeName);
        this.spr.moveTo(_pos);
        this.spr.width = size.width; // 種類ごとの大きさ設定
        this.spr.height = size.height;
        entityUtil_1.entityUtil.appendEntity(this.spr, _parent);
        this.spr.modified();
        this.life = _level; // 生成時のレベルに応じてライフを設定
        // 周りの状況に限らずアニメの更新と移動を行う
        this.spr.update.handle(this, this.update);
    }
    /**
     * ゲーム中の更新処理
     * @return {boolean} 通常falseを返す
     */
    update() {
        if (!this.spr.destroyed()) {
            this.spr.x += this.moveX;
            this.spr.modified();
            this.spr.calc();
        }
        return false;
    }
    /**
     * 泥棒に当たった時
     */
    minusLife() {
        this.life -= 1;
        if (this.life <= 0) { // 弾の寿命が尽きる時
            this.destroySpr(); // 弾消す処理
        }
    }
    /**
     * 弾現在位置取得
     * @return {g.CommonOffset} 弾現在位置（原点）
     */
    getPosition() {
        return {
            x: this.spr.x,
            y: this.spr.y
        };
    }
    /**
     * 弾当たり判定用エリア取得
     * @return {g.CommonArea} 当たり領域
     */
    getCollArea() {
        // 原点が中心なので計算して返す
        return {
            x: this.spr.x - (this.spr.width / 2),
            y: this.spr.y - (this.spr.height / 2),
            width: this.spr.width,
            height: this.spr.height
        };
    }
    /**
     * 倒した数取得
     * @return {number} 倒した数
     */
    getKill() {
        return this.kill;
    }
    /**
     * sprが削除されたか調べる
     * @return {boolean} 削除されていたらtrue
     */
    checkSprDestroyed() {
        return this.spr.destroyed();
    }
    /**
     * 倒した数加算
     */
    addKill() {
        if (this.kill >= define_1.define.MAX_COMBO) { // MAX以上は加算しない
            return;
        }
        this.kill += 1;
    }
    /**
     * sprのdestroy
     */
    destroySpr() {
        if (!this.spr.destroyed()) {
            this.spr.destroy();
        }
    }
}
exports.Bullet = Bullet;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
window.gLocalAssetContainer["gameCreator"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const thiefBuster_1 = require("./thiefBuster");
/**
 * GameBaseの実装クラスのインスタンス生成を行うだけのクラス
 * GameSubsceneに対して実装クラスの名前を隠ぺいする
 */
class GameCreator {
    /**
     * GameBaseの実装クラスのインスタンスを生成する
     * @param {g.Scene}  _scene インスタンス生成に使用するScene
     * @return {GameBase} 生成されたインスタンス
     */
    static createGame(_scene) {
        return new thiefBuster_1.ThiefBuster(_scene);
    }
}
exports.GameCreator = GameCreator;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
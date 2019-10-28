window.gLocalAssetContainer["subscene"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 具体的なシーンの処理と表示を行う抽象クラス
 */
class Subscene extends g.E {
    constructor(_scene) {
        super({ scene: _scene });
    }
}
exports.Subscene = Subscene;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
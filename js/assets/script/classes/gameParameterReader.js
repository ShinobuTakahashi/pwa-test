window.gLocalAssetContainer["gameParameterReader"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commonParameterReader_1 = require("../commonNicowariGame/commonParameterReader");
const define_1 = require("./define");
const miscAssetInfo_1 = require("./miscAssetInfo");
/**
 * ゲーム固有パラメータの読み込みクラス
 * 省略されたパラメータ項目の補完などを行う
 */
class GameParameterReader {
    /**
     * 起動パラメータから対応するメンバ変数を設定する
     * @param {g.Scene} _scene Sceneインスタンス
     */
    static read(_scene) {
        // 規定の出現間隔を割り当てる
        this.itemPopInterval = define_1.define.ITEM_POP_INTERVAL;
        // 規定のスタート時アイテムを割り当てる
        this.startItemLevel = define_1.define.BulletLevel.nail;
        // 規定の敵データを割り当てる
        this.thiefPopRates = define_1.define.THIEF_POP_RATES;
        if (!commonParameterReader_1.CommonParameterReader.nicowari) {
            if (commonParameterReader_1.CommonParameterReader.useDifficulty) {
                // 難易度指定によるパラメータを設定
                this.loadFromJson(_scene);
            }
            else {
                const param = _scene.game.vars.parameters;
                if (typeof param.itemPopInterval === "number") {
                    this.itemPopInterval = param.itemPopInterval;
                }
                if (typeof param.startItemLevel === "number") {
                    this.startItemLevel = param.startItemLevel;
                }
                if (param.thiefPopRates) {
                    this.thiefPopRates = (param.thiefPopRates);
                }
            }
        }
    }
    /**
     * JSONから難易度指定によるパラメータを設定
     * @param {g.Scene} _scene Sceneインスタンス
     */
    static loadFromJson(_scene) {
        const difficultyJson = JSON.parse(_scene
            .assets[miscAssetInfo_1.MiscAssetInfo.difficultyData.name].data);
        const difficultyList = difficultyJson.difficultyParameterList;
        if (difficultyList.length === 0) {
            return;
        }
        let index = 0;
        for (let i = difficultyList.length - 1; i >= 0; --i) {
            if (difficultyList[i].minimumDifficulty
                <= commonParameterReader_1.CommonParameterReader.difficulty) {
                index = i;
                break;
            }
        }
        if (typeof difficultyList[index].itemPopInterval === "number") {
            this.itemPopInterval = difficultyList[index].itemPopInterval;
        }
        if (typeof difficultyList[index].startItemLevel === "number") {
            this.startItemLevel = difficultyList[index].startItemLevel;
        }
        if (difficultyList[index].embedNumber) {
            this.thiefPopRates = [];
            const length = difficultyList[index].embedNumber.length;
            for (let i = 0; i < length; ++i) {
                const phase = difficultyList[index].embedNumber[i];
                this.thiefPopRates[i] = define_1.define.THIEF_POP_RATES[phase - 1];
            }
        }
    }
}
exports.GameParameterReader = GameParameterReader;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
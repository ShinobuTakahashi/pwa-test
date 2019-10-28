window.gLocalAssetContainer["soundInfo"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 音声アセット関連の静的情報
 */
class SoundInfo {
}
/** SE名のマップ */
// tslint:disable-next-line:typedef
SoundInfo.seSet = {
    attack: "se_action24_changed",
    hit: "se_attack47",
    itemPop: "se_action14",
    itemGet: "se_button10",
    open: "se_real57",
    close: "se_real58",
    kill01: "se_action16",
    kill02: "se_action16_2",
    kill03: "se_action16_3",
    kill04: "se_action16_4"
};
/** BGM名のマップ */
// tslint:disable-next-line:typedef
SoundInfo.bgmSet = {
    title: "bgm_002_BPM222",
    main: "bgm_002_BPM222"
};
exports.SoundInfo = SoundInfo;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}
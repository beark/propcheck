"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@propcheck/core");
exports.unicode8Emoji = core_1.Generators.integral_(new core_1.Range(0x1f600, 0x1f64f, 0)).map(String.fromCodePoint);
exports.unicode8EmojiTextStyle = exports.unicode8Emoji.map(emo => emo + String.fromCodePoint(0xfe0e));
exports.unicode8EmojiWithStyle = exports.unicode8Emoji.andThen(emo => core_1.Generators.oneOf_(core_1.Gen.const(String.fromCodePoint(0xfe0e)), core_1.Gen.const(String.fromCodePoint(0xfe0f))).map(modifier => emo + modifier));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@propcheck/core");
exports.adversarialString = (gen) => core_1.Gen.sequence(core_1.Gen.const(""), gen.andThen(str => core_1.Generators.nat.andThen(n => core_1.Generators.integral_(new core_1.Range(0, maliciousCharacters.length, 0))
    .repeat(n / 4)
    .andThen(ms => core_1.Generators.integral_(new core_1.Range(0, str.length - 1, 0))
    .repeat(n / 4)
    .map(is => {
    let replaced = "";
    zip(ms, is).forEach(([m, i]) => {
        replaced +=
            str.substr(0, i) +
                maliciousCharacters[m] +
                str.substr(i + 1);
    });
    return replaced;
})))));
const maliciousCharacters = ["\0"];
const zip = (a, b) => a.map((v, i) => [v, b[i]]);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@propcheck/core");
exports.arbitraryObj = core_1.Generators.nat
    .scale(sz => Math.ceil(sz / 10))
    .andThen(n => objectProp.repeat(n).andThen(props => {
    let objGen = {};
    for (const prop of props) {
        objGen = Object.assign(Object.assign({}, objGen), prop);
    }
    return core_1.Generators.obj_(objGen);
}));
exports.arbitraryArray = core_1.Generators.nat.andThen(len => exports.arbitrary.repeat(len));
exports.arbitrary = undefined;
exports.arbitrary = core_1.Generators.frequency_({ weight: 5, gen: core_1.Generators.int }, { weight: 5, gen: core_1.Gen.sized(sz => core_1.Generators.num(new core_1.Range(-sz, sz, 0))) }, { weight: 5, gen: core_1.Generators.string(core_1.Generators.latin1) }, { weight: 5, gen: exports.arbitraryArray }, { weight: 5, gen: exports.arbitraryObj }, 
// { weight: 5, gen: Generators.fn(arbitrary) }, TODO: need to be lazily defined...
{ weight: 1, gen: core_1.Generators.oneOf_(core_1.Gen.const(true), core_1.Gen.const(false)) }, { weight: 1, gen: core_1.Gen.const(undefined) }, { weight: 1, gen: core_1.Gen.const(null) }, { weight: 1, gen: core_1.Gen.const(Infinity) }, { weight: 1, gen: core_1.Gen.const(-Infinity) }, { weight: 1, gen: core_1.Gen.const(NaN) });
const objectProp = core_1.Generators.integral_(new core_1.Range(0, 15, 0)).andThen(keyLen => {
    return core_1.Generators.alpha
        .andThen(first => core_1.Generators.alphaNum
        .repeat(keyLen)
        .map(rest => first + rest.join("")))
        .map(key => ({
        [key]: exports.arbitrary,
    }));
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@propcheck/core");
const basecaseGens = [
    { weight: 1, gen: core_1.Gen.const(undefined) },
    { weight: 1, gen: core_1.Gen.const(null) },
    { weight: 1, gen: core_1.Gen.const(Infinity) },
    { weight: 1, gen: core_1.Gen.const(-Infinity) },
    { weight: 1, gen: core_1.Gen.const(NaN) },
    {
        weight: 2,
        gen: core_1.Generators.oneOf_(core_1.Gen.const(true), core_1.Gen.const(false)),
    },
    { weight: 5, gen: core_1.Generators.int },
    {
        weight: 5,
        gen: core_1.Gen.sized(sz => core_1.Generators.num(new core_1.Range(-sz, sz, 0))),
    },
    { weight: 5, gen: core_1.Generators.string(core_1.Generators.latin1) },
];
exports.arbitraryObj = makeArbitraryObject(3);
exports.arbitraryArray = makeArbitraryArray(3);
exports.arbitrary = makeArbitrary(3);
exports.arbitraryFn = makeArbitraryFn(3);
function makeArbitraryObject(recurDepth) {
    if (recurDepth <= 0) {
        return core_1.Gen.const({});
    }
    return core_1.Generators.nat
        .scale(sz => Math.ceil(sz / 10))
        .andThen(n => makeProp(recurDepth - 1)
        .repeat(n)
        .andThen(props => {
        let objGen = {};
        for (const prop of props) {
            objGen = Object.assign(Object.assign({}, objGen), prop);
        }
        return core_1.Generators.obj_(objGen);
    }));
}
function makeArbitraryArray(recurDepth) {
    if (recurDepth <= 0) {
        return core_1.Gen.const([]);
    }
    return core_1.Generators.nat.andThen(len => makeArbitrary(recurDepth - 1).repeat(len));
}
function makeArbitrary(recurDepth) {
    if (recurDepth <= 0) {
        return core_1.Generators.frequency(...basecaseGens);
    }
    return core_1.Generators.frequency(...basecaseGens.concat(
    // Ensure all the recursive generators are smaller than their parent
    { weight: 5, gen: makeArbitraryArray(recurDepth - 1) }, { weight: 5, gen: makeArbitraryObject(recurDepth - 1) }, { weight: 5, gen: makeArbitraryFn(recurDepth - 1) }));
}
function makeProp(recurDepth) {
    if (recurDepth <= 0) {
        return core_1.Gen.const({});
    }
    return core_1.Generators.integral_(new core_1.Range(0, 15, 0)).andThen(keyLen => {
        return core_1.Generators.alpha
            .andThen(first => core_1.Generators.alphaNum
            .repeat(keyLen)
            .map(rest => first + rest.join("")))
            .map(key => ({
            [key]: makeArbitrary(recurDepth),
        }));
    });
}
function makeArbitraryFn(recurDepth) {
    return core_1.Generators.fn(makeArbitrary(recurDepth), 16);
}

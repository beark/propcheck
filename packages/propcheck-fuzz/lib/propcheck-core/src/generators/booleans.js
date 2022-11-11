"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Gen_1 = require("../Gen");
const prng_1 = require("../prng");
/**
 * Generate a boolean value.
 *
 * - Size invariant.
 * - No shrink tree.
 */
exports.bool = Gen_1.Gen.fromFn((_, st) => prng_1.nextInt(st, { minBound: 0, maxBound: 1 }) === 0 ? false : true);

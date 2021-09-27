# Change Log - @propcheck/core

This log was last generated on Mon, 27 Sep 2021 10:54:21 GMT and should not be manually modified.

## 0.12.0
Mon, 27 Sep 2021 10:54:21 GMT

### Minor changes

- Ensure shrinks do not recurse infinitely by introducing options to limit the number of shrinks to try.

## 0.11.0
Sun, 19 Sep 2021 14:18:53 GMT

### Minor changes

- Relax constraint on returned shrinks to `Iterable<T>` instead of `Seq<T>`.
- Implement optional, nullable, and optionalNullable using frequency_ instead of Gen.sequence, to avoid too predictable and non-exhaustive sequences. Especially in multi-parameter properties.

### Patches

- Make `Tree.from` more lazy in its evaluation of tree-like iterables.
- Add breadth first iteration of trees.
- Update TypeScript version to 4.4.3.

## 0.10.0
Sun, 05 Sep 2021 00:03:27 GMT

### Minor changes

- Improved input validation and added `asciiBiasedUnicode` generator.
- Added `propertyNameOf` generator.
- Allow any truthy value, and `undefined`, to indicate that a property held, and all falsy values (except `undefined`) to indicate that it was falsified.

### Patches

- Update dependencies, set supported node version range.


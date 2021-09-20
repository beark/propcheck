# Change Log - @propcheck/core

This log was last generated on Sun, 19 Sep 2021 14:18:53 GMT and should not be manually modified.

## 0.11.0
Sun, 19 Sep 2021 14:18:53 GMT

### Minor changes

- Relax constraint on returned shrinks to `Iterable<T>` instead of `Seq<T>`.
- Implement optional, nullable, and optionalNullable using frequency_ instead of Gen.sequence, to avoid too predictable and non-exhaustive sequences. Especially in multi-parameter properties.

### Patches

- Make `Tree.from` more lazy in its evaluation of tree-like iterables.
- Add breadth first iteration of trees.
- Update TypeScript version to 4.4.3.


# `@propcheck/core`

As the name implies, this is the core library of [Propcheck](https://github.com/beark/propcheck), a suite of libraries and plugins for writing and running property based tests in TypeScript and JavaScript. This core should provide the primitives needed for anyone to either write their own property based testing framework, or to write something usable in combination with an existing testing framework. For an example of the latter, see [@propcheck/jest](https://github.com/beark/propcheck/tree/master/packages/propcheck-jest), a package that lets you run property based tests in Jest.

In any case, `@propcheck/core` contains a set of modules to do with property based testing:
- `Prng` -- a generator of pseudo randomness, the ultimate source of all generated values. Almost all generators in `Generator` are built on this module.
- `Gen` -- the core class that, by way of its combinators, is used to build value generators for your tests.
- `Generators` -- a number of primitives (eg, number and string generators) to build more advanced generators off of.
- `Runner` -- a module that can _run_ your property based tests and produce outcomes, try to shrink them, etc. Likely only of interest if you're looking to write your own test framework, or a plugin to an existing one (like `@propcheck/jest`).

All of these can be imported in one of two ways: either directly by path, or as an object from the `@propcheck/core` index:
```ts
// Method 1 examples
import Gen from "@propcheck/core/Gen";
import * as Gens from "@propcheck/core/generators";
import { makeSeedState } from "@propcheck/core/prng";

// Method 2 examples
import { Gen, Generators as Gens, Prng } from "@propcheck/core";
const { makeSeedState } = Prng;
```

Or, using commonjs modules:
```js
// Method 1 examples
const Gen = require("@propcheck/core/Gen").default;
const Gens = require("@propcheck/core/generators");
const { makeSeedState } = require("@propcheck/core/prng");

// Method 2 examples
const { Gen, Generators: Gens, Prng } = require("@propcheck/core");
const { makeSeedState } = Prng;
```

If you're just writing some tests, the only ones you likely need to conern yourself with are `Gen` and `Generators`, but let's dive into these modules a bit and explore what they provide.

## Prng

At the heart of any property based testing library is some means of getting "randomness". Not true randomness, because a test should always be deterministically repeatable, but nevertheless, we want to be able to generate seemingly random inputs for our properties. `@propcheck/core` provides this via the `Prng` module (`import { Prng } from '@propcheck/core'` or `import * as Prng from '@propcheck/core/lib/prng'`). This module exposes some simple primitives from which we can build all the goodness. The most important ones are listed here:

```ts
// A value of this type is a "seed", which can be fed to one of the next*
// functions to produce a repeatable pseudo-random number. 
type SeedState = {...};

// Given a seed value, return a pseudo-random floating point number in the
// provided inclusive range. The range defaults to { 0, 1 }.
// Always produces the same number for a given seed.
function nextNum(
    seed: SeedState,
    range?: { minBound: number, maxBound: number}
): number;

// Given a seed value, return a pseudo-random integral number in the provided
// inclusive range. The range defaults to
// { Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER }.
// Always produces the same number for a given seed.
function nextInt(
    seed: SeedState,
    range?: { minBound: number, maxBound: number}
): number;
```

Most of the generators (see next section) provided by `@propcheck/core` are at the end of the day built on top of these Prng primitives.

## Gen and Generators

A generator is effectively a function that, given some seed, can produce a pseudo-random value of some desired type. Typically, they are also constrained such that the generated values meet some set of criteria. For example, instead of a `number` generator just spitting out arbitrary numbers, it might produce only integers.

Many generators also embed a notion of "size", where their generated value will depend on not only a seed, but also some sort of size. This allows a property test to start out with "small" values and then incrementally test larger and larger ones. For example, an `Array` generator might yield the following initial sequence of values in a test run:

1. `[]`
2. `[3]`
3. `[7, 4]`
4. `[3, 7, 6, 4, 10, 2]`

And so on.

Similarly, many generators will technically not only generate a value, but rather a value and a tree of possible _shrinks_ of that value. This allows the test framework to try to shrink complex values for which some property failed into simpler ones, recheck the property, and if it still fails report only the _simpler_ value for which the property failed.

All of the generators included in `@propcheck/core` package include information about both how they behave with regards to _size_, and what kind of _shrink trees_ they generate.

In Propcheck, generators take the form of a class with some static "constructors" and a set of combinator-style methods (think "fluent" interfaces):

```ts
class Gen<T> {
    andThen: <U>(f: (x: T) => Gen<U>): Gen<U>
    map: <U>(f: (x: T) => U): Gen<U>
    repeat: (n: number): Gen<T[]>
    // And others
}
```

A variable of type `Gen<T>` is a generator of values of type `T`. So, a `g: Gen<number>` will generate numbers of some kind.

### Core Generators

A number of foundational generators are all included as static "constructors" on the `Gen` class, and are the core pieces from which every other generator is composed. Here are a couple of them:

```ts
// Always generates the value 1, regardless of seed and size
const alwaysOne = Gen.const(1);

// Will always generate the current size as its output
const size: Gen<number> = Gen.sized(size => Gen.const(size))

// Use the given generator function to produce a value from a desired size and a
// pseudo-random seed
const rand: Gen<string> = Gen.fromFn((size, seed) => f(size, seed));

function f(size: number, seed: SeedState): string {
    // Somehow produce a string from size and seed
}
```

### Combinators

As mentioned, most generators--including many exposed in `@propcheck/core`--are composed by combining or augmenting those root generators. Here are some of the commonly used combinators for that:
```ts
// Given some number generator
declare const n: Gen<number>;

// We can map its value to apply a pure transformation
const nstring: Gen<string> = n.map(num => num.toString());

// We can repeat the generator in a sequence, to get an array of numbers
const tenNums: Gen<number[]> = n.repeat(10);

// Or we can sequence a function that creates a generator to do so from the
// generated number
const arr: Gen<number[]> = n.andThen(len => n.repeat(len));

// We can also apply predicates to a generator, so it will only generate values
// that satisfy the given predicate. Note that predicate based generators may
// display poor performance -- if you can figure out how, it's almost always
// better to express generators as maps, andThens, etc.
const even = n.suchThat(n => n % 2 === 0);

// For example, instead of the above and assuming n generates integers, you
// could write something like "even" simply as:
const even = n.map(x => 2 * x);

// Picks one of the given values with equal probability
const oneOrZero = Generators.elementOf(Gen.const(0), Gen.const(1));

// Picks one of the given generators with a probability equal to its weight
// divided by the sum of all weights. Weights should always be integral.
const probabilities = Generators.frequency(
    { gen: Gen.const(0), weight: 1 },
    { gen: Gen.const(1), weight: 2 },
    { gen: Gen.const(2), weight: 4 }
);
```

These operations may seem simple, but you'll find that they're quite powerful and will allow you to generate almost anything.

### Shrinking

By default, the core generators (the ones available as static methods on `Gen`) do not assume anything about how to shrink the generated values--though many of the other ones do. When we create our own generators, we thus sometimes have to embed this knowledge ourselves. We can do that with `Gen.shrink`:

```ts
// Given a number generator
declare const n: Gen<number>

// We can say what the available shrinks are for any particular value it
// produces:
n.shrink(num => {
    if (num > 100) {
        // For numbers > 100, they can be shrunk to 0, 50, and 75
        return new Seq([0, 50, 75]);
    } else if (num > 0) {
        // Numbers greater than 0 but smaller than 100 can only shrink to 0
        return Seq.singleton(0);
    } else {
        // Nothing else can be shrunk
        return Seq.empty();
    }
});
```

In many cases, you probably don't have to do this shrinking manually. The (non-core) generators provided by `@propcheck/core` will handle a lot of possible shrink cases you may want quite well. For example, to generate integral numbers in the range 0-100 that shrink towards 0:

```ts
import { Generators as G, Range } from '@propcheck/core';

const myNumGen: Gen<number> = G.integral(
    new Range(
        0,      // Minimum bound
        100,    // Maximum bound
        0       // "Origin" towards which shrinks will edge
    )
);
```

For the above generator, the shrink tree produced if the generated value is, say, 10 would be:

```
10
|-- 0
|-- 1
|   `-- 0
|-- 2
|   |-- 0
|   `-- 1
|       `-- 0
`-- 5
    |-- 0
    |-- 1
    |   `-- 0
    `-- 2
        |-- 0
        `-- 1
            `-- 0
```

That is, the possible shrinks directly from 10 are (in the order they'd be likely be attempted): 0, 1, 2, 5. You may have noticed that there's repetition in the tree. This is not normally a problem because the shrink trees are generated lazily.

### Useful Generators

Besides just `integral`, `@propcheck/core` comes with quite a few other generators for the primitive JavaScript types, as well as a few combinators to compose those into, eg, object generators, array generators, and more. Here's a sample of them:

- Numbers
    ```ts
    import {
        // Generator for natural numbers (0, 1, 2, ...)
        // Grows with size, shrinks toward 0
        nat,

        // Generator for (floating point) numbers within some given range
        // Shrinks toward the origin of the range
        // Like integral above, but for non-integral numbers
        num
    } from "@propcheck/core/generators";
    ```
- Strings
    ```ts
    import {
        // Generators for single lower and upper case ASCII characters
        lower, upper,

        // Generator for a single alpha-numeric ASCII character
        alphaNum,

        // Generator for a single valid code point in the full Unicode set
        unicode,

        // Combinator that, given a character generator, generates strings
        // Result shrinks toward a zero-length string
        string
    } from "@propcheck/core/generators";

    // Example usage of string to make a generator of alpha-numeric strings
    const alphanumString = string(alphaNum);
    ```
- Arrays and tuples
    ```ts
    import {
        // As described earlier
        nat, alphaNum

        // Given a generator, this creates a generator for arrays of whatever type
        // the given generator produces. Shrinks toward a zero-length array.
        arrayOf,

        // Given some set of generators, creates a generator for tuples of all the
        // argument generator types
        tuple
    } from "@propcheck/core/generators";

    const arrayOfNats: Gen<number[]> = arrayOf(nat);
    const twoNats: Gen<[number, number]> = tuple(nat, nat);
    const threeThings: Gen<[number, number, string]> = tuple(nat, nat, alphaNum)
    ```

## Runner

This module is responsible for running your tests. It is written in such a way as to be entirely agnostic of which context it is being run in, and to easily be run in a deterministic fashion. Ie, given the same input, all exported functions of `Runner` will always yield the same result.

There are two primary functions exported by `Runner`: `given`, and `shrink`. `given` is the entry point to running a check, you do so by providing it the argument generators for the property, and then invoking `check` what it returns:

```ts
import { Runner } from '@propcheck/core';

// If you're using TypeScript, propcheck will ensure that the generators you
// provide match myProperty's parameters in both type and arity.
// If you're using JS, you're out of luck and will likely get a runtime error
// if you get it wrong :(
const result = Runner.given(some, generators).check(myProperty);
```

Here, `result` will contain the outcome of running checks on `myProperty` using the default options. It will also have some potentially useful additional data. For example, in addition to `pass: true | false`, it will have information such as which seed the check failed for (if it failed), how many iterations of values the check generated, what size of values were generated, the actual generated arguments for which the property failed (if it failed), etc.

You can customize properties of the check that will run via `withOptions`:
```ts
const result = Runner
    .given(Generators.int)
    .withOptions({ seed: 'some seed' })
    .check(myIntProperty);
```

The second function provided by `Runner`, `shrink`, does essentially what the name says: it will try to shrink the set of arguments for which a property failed until it finds the smallest ones for which the property still failed. Assuming you just found out `result` above had `pass: false`, you can try to shrink the arguments like this:
```ts
const { shrinks, smallestFailingArgs } = Runner
    .shrink(myIntProperty, result.args);
```

Here, `shrinks` is a counter of the number of shrinks that were performed, and `smallestFailingArgs` is an array containing the smallest found arguments for which the property still failed. If no attempted shrinks failed `myIntProperty`, this field will be missing from the result of `shrink`.

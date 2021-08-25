# Propcheck
 
Propcheck is a suite of libraries and plugins for writing and running property based tests in TypeScript and JavaScript. Some of the most important sub-packages are:
- [@propcheck/core](https://github.com/beark/propcheck/tree/master/packages/propcheck-core) -- The foundation of all Propcheck functionality.
- [@propcheck/jest](https://github.com/beark/propcheck/tree/master/packages/propcheck-jest) -- A Jest extension to integrate Propcheck-based testing into your regular Jest tests.

The concepts and abstractions used are heavily inspired by [Quickcheck](http://hackage.haskell.org/package/QuickCheck) and [Hedgehog](http://hackage.haskell.org/package/hedgehog), two property based testing frameworks for Haskell.

## Property based testing

Property based testing is a little bit like fuzz-testing, except more focused on formal correctness and less on finding security issues. Specifically, a property based test tests that some _property_ holds for many/most possible inputs to a function. What's a property? Something like a mathematical law, or an invariant. It could be anything from a well-known thing like associativity or commutativity, to something entirely unique to your domain, "calling `foo` with a number and any value of type `Bar` should always return non-zero".

The property itself would typically just be written as a function from the input type(s) to a boolean specifying whether or not the property held for that input. In Propcheck, throwing an exception will also indicate the property failed, allowing for easy use of existing test assertions in property definitions. A classic example of a property based test would be how `Array.reverse` should satisfy the property
```ts
function reverseReverseIsId(arr: Array<unknown>) {
    expect(arr.reverse().reverse()).toEqual(arr)
}
```

Here, we used Jest/Jasmine `expect` for simplicity, but we could have used any deep array comparison operation, really. What the framework does for you, is generate hundreds, or even thousands of possible arrays to test this property with and then report any input array it could find for which the property did not hold. This works for any number of arguments and types, so long as you can provide a way for Propcheck to generate them (you can read more about generators in the [@propcheck/core](https://github.com/beark/propcheck/tree/master/packages/propcheck-core) documentation). For example, here is another simple property: plus should satisfy associativity:
```ts
function plusIsAssoc(a: number, b: number, c: number) {
    return a + (b + c) === (a + b) + c;
}
```

Note that in this case, we used a simple `boolean` return value to communicate the outcome (whether the property held for the given inputs or not). Propcheck generally allows for two ways of signalling success/failure:
- Via `boolean`-ish return value. In particular, anything truthy is considered a success, and anything falsy -- except `undefined` -- is considered a failure. Note that `undefined` is assumed to mean _no_ return value, not a falsy return!
- Via exception. If the property function throws anything at all, the property is considered falsified.

Most property-based testing frameworks (including Propcheck) do even more for you than just test a property: they will also try to _shrink_ any value for which the property fails before reporting it to you. What exactly "shrinking" means may depend on the data type, but some common ways of shrinking include:

- Nudging a number smaller/closer to 0.
- Cutting elements off an array to make it shorter.
- Removing characters from a string to make it shorter.

The value of this is that, while the input the framework first generated that the property failed for may be very large and complex to reason about (making it hard to figure out why the property failed), the value the framework _reports_ will have gone through shrinking first and should be much "smaller" and therefore easier to reason about!

Obviously, running tests like the above _exhaustively_ (for every possible input value) is not realistic, since there is an unbounded number of possible arrays to test. Hence the above disclaimer of "many/most inputs". Typically, you can configure yourself how many possible inputs to test with to ensure your test runs don't become excessively long.

## Quick Setup

Assuming you're already using Jest to write your tests, then writing Propcheck tests is a breeze. You'll want to install `@propcheck/core` and `@propcheck/jest` as development dependencies:
```
~/my-project$ npm i @propcheck/core @propcheck/jest -D
```

Or if you're using yarn:
```
~/my-project$ yarn add @propcheck/core @propcheck/jest -D
```

And then add the following to your jest config:
```json
{
    "setupFilesAfterEnv": [
        "Any other setup file you may already have",
        "@propcheck/jest"
    ]
}
```

Once that's done, you should be ready to write some tests! It might look something like this:
```ts
import { Generators } from '@propcheck/core';

describe("My property tests", () => {
    it("map preserves identity", () => {
        // The identity function
        const id = x => x;

        // Given some array, xs
        const mapPreservesId = xs => {
            const ys = xs.map(id);

            // We expect that mapping the identity function should be equivalent
            // to the identity operation
            expect(xs).toEqual(ys);
        };

        // Expect the mapPreservesId proeprty to hold for any array of ints we
        // throw at it
        expect(mapPreservesId).forall(Generators.arrayOf(Generators.int))
    });
});
```

For more details, see the documentaiton of the individual Propcheck packages you end up using!

## Why property based testing?

TL;DR: Everything good you get from unit testing, but _more_ of it.
- Because a function has now been tested potentially for multiple properties with 100-1000s of different inputs each, it is safe to conclude that the correctness guarantees are significantly stronger than for traditional fixed input unit tests.
- If ensuring your code is unit testable tends to lead to simpler implementation code and better design in the end, then doing the same for property based tests is even better. Functions that can be tested for properties usually end up entirely (or almost entirely) pure, leading to code that is easier to read, reason about, and refactor.
- A property based tests effectively documents a mathematical law about one or more operations and their inputs. Indeed, it is _very_ valuable documentation for consumers of the operation(s) under test, as it will tell them things they can apply when using it! For example, it's possible the knowledge of a property may allow them to simplify their own code in some cases.
- You'll sleep better at night, knowing you've thrown all those thousands of inputs at your function and it's behaving as you'd expect for each one!

## Why not property based testing?

- Represents more time investment in testing, which may not be desirable to everyone.
    - Learning curve: it will take you and your team a while to learn common properties data types may have, how to spot them in the wild, how to figure out domain specific properties, etc. Not only that, it will also take a while to figure out how to even write and structure code that naturally gives rise to properties.
    - In other words: typically, a _lot_ more thought goes into writing a single property test than a unit test.
- Can require significant resources.
    - If running your normal test pipeline seems to take too long, then running a number of tests that throw huge amounts of inputs at functions isn't going to make things better.
    - Complex generators may not scale very well (ie, have bad big O complexity or memory requirements), and thus be more costly than they're worth to run thousands of times on every PR to test a single function.

In the end, it's up to you to decide when or even _if_ it's worthwhile to use property based testing, but it seems exceedingly rare that someone regrets the choice to do so (albeit, in a selective manner).

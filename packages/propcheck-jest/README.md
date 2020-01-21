# `@propcheck/jest`

This is a [jest](https://jestjs.io/) extension that allows you to effortlessly integrate property based testing with your regular Jest tests. For more information on what exactly that means and how to write them, see the base [propcheck documentation](https://github.com/beark/propcheck) and [@propcheck/core](https://github.com/beark/propcheck/tree/master/packages/propcheck-core).

The main facility provided by this package is the `expect` extension `forall`. It is used anywhere in a regular Jest test like so:

```ts
expect(someProperty).forall(generator1, generator2, ..., generatorN)
```

where `someProperty` is a property and `generator1`, `generator2`, etc are generators. Both of these concepts are explained more [here](https://github.com/beark/propcheck/blob/master/packages/propcheck-core/README.md).

When defining your property, you are free to use any of the following mechanisms to signal success/failure:
-   Return a truthy value in the property to indicate it passed
-   Return a falsy value to indicate it didn't hold for the given input
-   Any thrown errors will also be interpreted as the property failing
-   You can also simply use `expect` as you would in any Jest test

Here's a more complete example:
```ts
import { arrayOf, nat } from '@propcheck/core/generators';

describe("My property tests", () => {
    it("plus is associative", () => {
        const plusAssoc = (a: number, b: number, c: number) =>
            a + (b + c) === (a + b) + c;
        
        expect(plusAssoc).forall(nat, nat, nat);
    });

    it("Array.reverse().reverse() is an identity op", () => {
        const revrevIsId = (arr: number[]) => {
            expect(arr.reverse().reverse()).toEqual(arr);
        };

        expect(revrevIsId).forall(arrayOf(nat));
    });
});

```

If you want to use this package, then generally you'll want at least [@propcheck/core](https://github.com/beark/propcheck/tree/master/packages/propcheck-core) too, so you have access to a good base of generators to build on.

## Installation & Setup

With npm:
```
$ npm installl --save-dev @propcheck/core @propcheck/jest
```

With yarn:
```
$ yarn add -D @propcheck/core @propcheck/jest
```

After installing `@propcheck/core` and `@propcheck/jest`, add the latter to your jest configuration's setup files. For example, in your package.json:
```json
{
    "name": "myProject",
    "scripts": {
        "test": "jest",
    },
    "jest": {
        "setupFilesAfterEnv": [
            "Any other setup files you may have",
            "@propcheck/jest"
        ]
    }
}
```

Finally, if you're writing your tests in TypeScript, you may have to ensure the inclusion of the types of `@propcheck/jest` extensions by either modifying your tsconfig.json, or using an empty import of `@propcheck/jest`. The former should be a once per project configuration change, and might look like this:
```json
{
    "compilerOptions": {
        "types": ["@types/jest", "@propcheck/jest"]
    }
}
```

The latter you'd have to do in every file where you want to use an extension provided by `@propcheck/jest` and would simply look like this:
```ts
import {} from "@propcheck/jest";

describe("MyTest", () => {
    it("works", () => {
        expect(myProperty).forall(...generators);
    });
});
```

NOTE: if you know how this last setup step for types can be removed/automated, PRs are welcome!

## Determinism

What good is a failing test if you can't repeat it to figure out if you've really solved it? And what about all those people saying randomness has no place in tests -- doesn't the entire _idea_ of property based testing go against that?

To ensure this is never a problem in practice, Propcheck is, in fact, not based on randomness. It is based on repeatable pseudo-randomness. In fact, the `Runner` module of `@propcheck/core` is _completely pure_ (module effects performed by the function under test). If you run a test with a particular set of options, the result will always be _exactly_ the same (if not, you should [file a bug](https://github.com/beark/propcheck/issues)).

 While `@propcheck/jest` actually _does_ randomize the initial seed state, it nevertheless ensures runs are _repeatable_. Any time a test run results in property failure, the exact parameters for that specific iteration of the test will be printed. They are:

- Seed -- the seed that was used to generate the arguments for the property when it failed.
- Size -- the size that was used to decide how "large" the generated values should be.
- Iteration -- essentially, how many times the property had been tested. Some generators may give defferent results based on this.

Using these, you can re-run the exact iteration that resulted in a failure (thus cutting down on test-time) in two ways:

1. Programmatically pass the desired parameters to the test via `forallWithOptions`. Couple this with Jest's `fit`, and you can get to precisely the point where your test failed.
2. Provide the parameters via environment variables.

The former option might look like this:
```ts
fit('my test', () => {
    const seed = [124459077, 98394823, 87234902, 230109];
    const startIteration = 20;
    const startSize = 100;

    expect(property).forallWithOptions(
        { seed, startIteration, startSize },
        gen1,
        gen2
    );
});
```

And the latter might look something like this:
```
~/myProject$ PROPCHECK_SEED="{124459077, 98394823, 87234902, 230109}" PROPCHECK_STARTITER=20 PROPCHECK_STARTSIZE=100 npm test
```

Note that when setting options via environment variable, the options apply to _every_ `forall` or `forallWithOptions` being run. Ie, you probably want to focus specifically on the failing test. This is perhaps easiest done by command line argument to Jest:
```
~/myProject$ npm test -- -t "string matching a test name"
```

It can also be done in code with `fit`, as shown above.

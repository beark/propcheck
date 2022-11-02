import Seq from "lazy-sequences"
import { Tree } from "./Tree"

const id = <T>(x: T) => x
const singleton = <T>(x: T) => new Tree<T>(x, Seq.empty())

describe("Tree", () => {
    describe("from", () => {
        it("should correctly construct the singleton tree", () => {
            const sing = Tree.from([0, []])

            expect([...sing]).toEqual([0])
        })

        it("[sanity] should correctly construct some example trees", () => {
            const t0 = Tree.from([0, [1, [2, [3]]]])
            const t1 = Tree.from([1, [2, [3, [4]]]])
            const t2 = Tree.from([
                1,
                [
                    [2, [4, 5]],
                    [3, [4, 6, 7]],
                    [2, [4, 5]],
                    [3, [6, 7]],
                ],
            ])

            expect([...t0]).toEqual([...tree0])
            expect([...t0.breadthFirst()]).toEqual([...tree0.breadthFirst()])
            expect([...t1]).toEqual([...tree1])
            expect([...t1.breadthFirst()]).toEqual([...tree1.breadthFirst()])
            expect([...t2.breadthFirst()]).toEqual([
                ...unfoldedTree.breadthFirst(),
            ])
        })

        it("should work with exotic iterables, not just arrays", () => {
            const generator = function* () {
                yield 1
                yield [2, [3, 4]] as [2, [3, 4]]
                yield 3
            }

            const t0 = Tree.from([0, Seq.enumFrom(1).take(4)])
            const t1 = Tree.from([0, { [Symbol.iterator]: () => generator() }])

            expect([...t0]).toEqual([0, 1, 2, 3, 4])
            expect([...t0.breadthFirst()]).toEqual([0, 1, 2, 3, 4])
            expect([...t1]).toEqual([0, 1, 2, 3, 4, 3])
            expect([...t1.breadthFirst()]).toEqual([0, 1, 2, 3, 3, 4])
        })
    })

    describe("unfold", () => {
        it("[sanity] should correclty construct an example tree", () => {
            // 0
            // |-- 1
            // |   |-- 2
            // |   |   |-- 3
            // |   |   `-- 4
            // |   `-- 3
            // `-- 2
            //     |-- 3
            //     `-- 4
            const t = Tree.unfold(
                n => (n > 2 ? Seq.empty() : Seq.enumFrom(n + 1).take(2)),
                0,
            )
            expect([...t]).toEqual([0, 1, 2, 3, 4, 3, 2, 3, 4])
            expect([...t.breadthFirst()]).toEqual([0, 1, 2, 2, 3, 3, 4, 3, 4])
        })
    })

    it("map(id) === id", () => {
        const t0 = tree0.map(id)
        const t1 = tree1.map(id)

        expect([...t0]).toEqual([...tree0])
        expect([...t0.breadthFirst()]).toEqual([...tree0.breadthFirst()])
        expect([...t1]).toEqual([...tree1])
        expect([...t1.breadthFirst()]).toEqual([...tree1.breadthFirst()])
    })

    it("map changes all the values", () => {
        const t0 = tree0.map(x => x + 1)
        const t1 = tree1.map(x => x - 1)

        expect([...t0]).toEqual([...tree1])
        expect([...t0.breadthFirst()]).toEqual([...tree1.breadthFirst()])
        expect([...t1]).toEqual([...tree0])
        expect([...t1.breadthFirst()]).toEqual([...tree0.breadthFirst()])
    })

    it("concatMap(singleton) === id", () => {
        const t0 = tree0.concatMap(singleton)
        const t1 = tree1.concatMap(singleton)

        expect([...t0]).toEqual([...tree0])
        expect([...t0.breadthFirst()]).toEqual([...tree0.breadthFirst()])
        expect([...t1]).toEqual([...tree1])
        expect([...t1.breadthFirst()]).toEqual([...tree1.breadthFirst()])
    })

    it("concatMap maps over all values", () => {
        const t0 = tree0.concatMap(x => singleton(x + 1))
        const t1 = tree1.concatMap(x => singleton(x - 1))

        expect([...t0]).toEqual([...tree1])
        expect([...t0.breadthFirst()]).toEqual([...tree1.breadthFirst()])
        expect([...t1]).toEqual([...tree0])
        expect([...t1.breadthFirst()]).toEqual([...tree0.breadthFirst()])
    })

    it("prune removes all children", () => {
        expect(tree0.prune()).toEqual(new Tree(0, Seq.empty()))
        expect(tree1.prune()).toEqual(new Tree(1, Seq.empty()))
    })

    describe("iteration", () => {
        it("should visit all children in order", () => {
            const elements = Array.from(unfoldedTree)

            const expected = [1, 2, 4, 5, 3, 4, 6, 7, 2, 4, 5, 3, 6, 7]
            expect(elements).toEqual(expected)
        })
    })

    describe("expand", () => {
        it("should pass a simple sanity check", () => {
            const expanded = tree1.expand(x =>
                2 * x + 1 > 7 ? Seq.empty() : new Seq([2 * x, 2 * x + 1]),
            )
            expect([...expanded]).toEqual([...unfoldedTree])
            expect([...expanded.breadthFirst()]).toEqual([
                ...unfoldedTree.breadthFirst(),
            ])
        })
    })

    describe("breadthFirst", () => {
        it("should iterate known trees breadth first", () => {
            expect([...tree0.breadthFirst()]).toEqual([0, 1, 2, 3])
            expect([...tree1.breadthFirst()]).toEqual([1, 2, 3, 4])
            expect([...unfoldedTree.breadthFirst()]).toEqual([
                1, 2, 3, 2, 3, 4, 5, 4, 6, 7, 4, 5, 6, 7,
            ])
        })

        it("should make progress even when a tree has infinite children", () => {
            const inf = new Tree(0, Seq.enumFrom(1).map(Tree.singleton))

            let iters = 0
            for (const v of inf.breadthFirst()) {
                if (iters == 50) {
                    break
                }

                expect(v).toBe(iters)

                ++iters
            }

            expect.assertions(50)
        })
    })
})

const tree0 = new Tree<number>(
    0,
    new Seq([
        new Tree(1, Seq.empty()),
        new Tree(2, new Seq([new Tree(3, Seq.empty())])),
    ]),
)

const tree1 = new Tree<number>(
    1,
    new Seq([
        new Tree(2, Seq.empty()),
        new Tree(3, new Seq([new Tree(4, Seq.empty())])),
    ]),
)

const unfoldedTree = new Tree<number>(
    1,
    new Seq([
        new Tree(
            2,
            new Seq([new Tree(4, Seq.empty()), new Tree(5, Seq.empty())]),
        ),
        new Tree(
            3,
            new Seq([
                new Tree(4, Seq.empty()),
                new Tree(6, Seq.empty()),
                new Tree(7, Seq.empty()),
            ]),
        ),
        new Tree(
            2,
            new Seq([new Tree(4, Seq.empty()), new Tree(5, Seq.empty())]),
        ),
        new Tree(
            3,
            new Seq([new Tree(6, Seq.empty()), new Tree(7, Seq.empty())]),
        ),
    ]),
)

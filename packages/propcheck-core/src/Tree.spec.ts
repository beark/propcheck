import Seq from "lazy-sequences"
import { Tree } from "./Tree"

const id = <T>(x: T) => x
const singleton = <T>(x: T) => new Tree<T>(x, Seq.empty())

describe("Tree", () => {
    describe("from", () => {
        it("should correctly construct the singleton tree", () => {
            const sing = Tree.from([0, []])
            expect(sing).toEqual(Tree.singleton(0))
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

            expect(t0).toEqual(tree0)
            expect(t1).toEqual(tree1)
            expect(t2).toEqual(unfoldedTree)
        })
    })

    it("map(id) === id", () => {
        expect(tree0.map(id)).toEqual(tree0)
        expect(tree1.map(id)).toEqual(tree1)
    })

    it("map changes all the values", () => {
        expect(tree0.map(x => x + 1)).toEqual(tree1)
        expect(tree1.map(x => x - 1)).toEqual(tree0)
    })

    it("concatMap(singleton) === id", () => {
        expect(tree0.concatMap(singleton)).toEqual(tree0)
        expect(tree1.concatMap(singleton)).toEqual(tree1)
    })

    it("concatMap maps over all values", () => {
        expect(tree0.concatMap(x => singleton(x + 1))).toEqual(tree1)
        expect(tree1.concatMap(x => singleton(x - 1))).toEqual(tree0)
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
            expect(
                tree1.expand(x =>
                    2 * x + 1 > 7 ? Seq.empty() : new Seq([2 * x, 2 * x + 1]),
                ),
            ).toEqual(unfoldedTree)
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lazy_sequences_1 = require("lazy-sequences");
/**
 * A lazy non-empty tree type.
 *
 * @implements {Iterable<T>}
 * @template T
 */
class Tree {
    /**
     * Construct a tree from a value and a lazy sequence of child trees.
     *
     * @nosideeffects
     * @param {T} value The value of the root node of the tree.
     * @param {Seq<Tree<T>>} children Sequence of branch trees.
     * @returns {Tree<T>}
     */
    constructor(value, children) {
        this.value = value;
        this.children = children;
    }
    /**
     * Create a single value tree with no branches.
     *
     * @nosideeffects
     * @param {T} x The value to populate the tree with.
     * @returns {Tree<T>}
     * @template T
     */
    static singleton(x) {
        return new Tree(x, lazy_sequences_1.Seq.empty());
    }
    /**
     * Create a tree directly from nested iterables.
     *
     * @nosideeffects
     * @param {TreeLike<T>} t Root node and its children.
     * @returns {Tree<T>}
     * @template T
     * @example
     * const t = Tree.from([0, [1, 2, [3, [4]]]])
     * // Results in the tree:
     * // 0
     * // |-- 1
     * // |-- 2
     * // `-- 3
     * //     `-- 4
     */
    static from(t) {
        const children = [];
        for (const c of t[1]) {
            if (Array.isArray(c)) {
                children.push(Tree.from(c));
            }
            else {
                children.push(Tree.singleton(c));
            }
        }
        return new Tree(t[0], new lazy_sequences_1.Seq(children));
    }
    /**
     * Create a tree from an unfold function.
     *
     * Unless `unf` has a fix point base case (resulting in an empty sequence),
     * this will (lazily) generate an infinitely branching tree.
     *
     * This method is effectful only if `unf` is.
     *
     * @param {(x: T) => Seq<T>} unf
     *   Unfolding function to apply recursively on leafs to generate the sub-
     *   children.
     * @param {T} x The initial value to begin the unfold from. Will be the
     *   value of the root node.
     * @template T
     */
    static unfold(unf, x) {
        return new Tree(x, unfoldForest(unf, x));
    }
    [Symbol.iterator]() {
        return iterateTree(this);
    }
    /**
     * Regular `concatMap` as it applies to trees.
     *
     * Ie, this operation is essentially equivalent of recursively mapping the
     * given function on all the elments in the tree--turning each node into a
     * tree itself--then flattening that by concatenating the new branches to
     * the children of the original node.
     *
     * As most methods on `Tree`, `concatMap` is strict in the root element,
     * while lazy in the child nodes.
     *
     * This function is effectful only if `f` is.
     *
     * @param {(x: T) => Tree<U>} f Function to map.
     * @returns {Tree<U>}
     * @template U
     */
    concatMap(f) {
        const k = f(this.value);
        return new Tree(k.value, this.children.map(t => t.concatMap(f)).concat(k.children));
    }
    /**
     * Expand the tree with an unfolding function.
     *
     * Each step of recursion will unfold on the current node's value (similarly
     * to how {@link Tree#unfold} generates children at a given level) and
     * concatenate those to the result of `expand`ing all of the node's existing
     * children (ie, this is the recursion step).
     *
     * Unless the given unfold function has a fix point base case (returning the
     * empty sequence), this will (lazily) generate an infinitely branching
     * tree.
     *
     * As most other methods on `Tree`, this is strict in the root node, lazy in
     * all the children.
     *
     * Note that `unf` is not applied to the root, so calling this function is
     * effect free, but iterating the result might not be.
     *
     * @nosideeffects
     * @param {(x: T) => Seq<T>} unf The unfolding function.
     * @returns {Tree<T>}
     */
    expand(unf) {
        return new Tree(this.value, this.children
            .map(t => t.expand(unf))
            .concat(unfoldForest(unf, this.value)));
    }
    /**
     * Map a given function to every node in the tree.
     *
     * As most other methods on `Tree`, this is strict in the root node, lazy in
     * all the children.
     *
     * This function is effectful only if `f` is.
     *
     * @param {(x: T) => U} f
     * @returns {Tree<U>}
     */
    map(f) {
        return new Tree(f(this.value), this.children.map(t => t.map(f)));
    }
    /**
     * Prune all the branches off the node, leaving only the root.
     *
     * @nosideeffects
     * @returns {Tree<T>}
     */
    prune() {
        return Tree.singleton(this.value);
    }
}
exports.Tree = Tree;
exports.default = Tree;
function* iterateTree(tree) {
    yield tree.value;
    for (const child of tree.children) {
        for (const v of child) {
            yield v;
        }
    }
}
function unfoldForest(unf, x) {
    return unf(x).map(seq => Tree.unfold(unf, seq));
}

import { Seq } from "lazy-sequences"

/**
 * A tree built by nested iterables.
 *
 * @typeParam T - Element type.
 */
export type TreeLike<T> = [T, Iterable<T | TreeLike<T>>]

/**
 * A lazy non-empty tree type.
 */
export class Tree<T> implements Iterable<T> {
    /**
     * Create a single value tree with no branches.
     *
     * @param x - The value to populate the tree with.
     *
     * @throws `never`
     *
     * @nosideeffects
     */
    static singleton<T>(x: T): Tree<T> {
        return new Tree(x, Seq.empty())
    }

    /**
     * Create a tree directly from nested iterables.
     *
     * @example
     *
     * ```ts
     * const t = Tree.from([0, [1, 2, [3, [4]]]]) // Results in the
     * tree: // 0 // |-- 1 // |-- 2 // `-- 3 // `-- 4.
     * ```
     *
     * @param t - Root node and its children.
     *
     * @nosideeffects
     */
    static from<T>(t: TreeLike<T>): Tree<T> {
        const children = new Seq(t[1]).map(leafOrTree =>
            Array.isArray(leafOrTree)
                ? Tree.from(leafOrTree)
                : Tree.singleton(leafOrTree),
        )

        return new Tree(t[0], children)
    }

    /**
     * Create a tree from an unfold function.
     *
     * @remarks
     * Unless `unf` has a fix point base case (resulting in an empty sequence),
     * this will (lazily) generate an infinitely branching tree.
     *
     * This method is effectful only if `unf` is.
     * @param unf - Unfolding function to apply recursively on leafs to generate
     *   the sub- children.
     * @param x - The initial value to begin the unfold from. Will be the value
     *   of the root node.
     */
    static unfold<T>(unf: (x: T) => Iterable<T>, x: T): Tree<T> {
        return new Tree(x, unfoldForest(unf, x))
    }

    /**
     * Construct a tree from a value and a lazy sequence of child trees.
     *
     * @param value - The value of the root node of the tree.
     * @param children - Sequence of branch trees.
     *
     * @throws `never`
     *
     * @nosideeffects
     */
    constructor(
        public readonly value: T,
        public readonly children: Seq<Tree<T>>,
    ) {}

    /**
     * Depth first iteration of the tree.
     *
     * @remarks
     * While this function is effect-free, iterating the result might not be.
     * If, for example, an effectful function has been {@link Tree#expand}:ed,
     * iteration will repeat that effect for each node.
     * @nosideeffects
     */
    [Symbol.iterator](): IterableIterator<T> {
        return depthFirst(this)
    }

    /**
     * Breadth first iteration of the tree, in the form of a Sequence.
     *
     * @remarks
     * While this function is effect-free, iterating the result might not be.
     * If, for example, an effectful function has been {@link Tree#expand}:ed,
     * iteration will repeat that effect for each node.
     * @nosideeffects
     */
    breadthFirst(): Seq<T> {
        return new Seq({ [Symbol.iterator]: () => breadthFirst(this) })
    }

    /**
     * Regular `concatMap` as it applies to trees.
     *
     * @remarks
     * Ie, this operation is essentially equivalent of recursively mapping the
     * given function on all the elments in the tree--turning each node into a
     * tree itself--then flattening that by concatenating the new branches to
     * the children of the original node.
     *
     * As most methods on `Tree`, `concatMap` is strict in the root element,
     * while lazy in the child nodes.
     *
     * This function is effectful only if `f` is.
     * @param f - Function to map.
     */
    concatMap<U>(f: (x: T) => Tree<U>): Tree<U> {
        const k = f(this.value)

        return new Tree(
            k.value,
            this.children.map(t => t.concatMap(f)).concat(k.children),
        )
    }

    /**
     * Expand the tree with an unfolding function.
     *
     * @remarks
     * Each step of recursion will unfold on the current node's value (similarly
     * to how {@link Tree.unfold} generates children at a given level) and
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
     * @param unf - The unfolding function.
     *
     * @nosideeffects
     */
    expand(unf: (x: T) => Iterable<T>): Tree<T> {
        return new Tree(
            this.value,
            this.children
                .map(t => t.expand(unf))
                .concat(unfoldForest(unf, this.value)),
        )
    }

    /**
     * Map a given function to every node in the tree.
     *
     * @remarks
     * As most other methods on `Tree`, this is strict in the root node, lazy in
     * all the children.
     *
     * This function is effectful only if `f` is.
     */
    map<U>(f: (x: T) => U): Tree<U> {
        return new Tree(
            f(this.value),
            this.children.map(t => t.map(f)),
        )
    }

    /**
     * Prune all the branches off the node, leaving only the root.
     *
     * @nosideeffects
     */
    prune(): Tree<T> {
        return Tree.singleton(this.value)
    }
}

export default Tree

function* depthFirst<T>(tree: Tree<T>) {
    yield tree.value

    for (const child of tree.children) {
        for (const v of child) {
            yield v
        }
    }
}

function* breadthFirst<T>(tree: Tree<T>) {
    const queue = [tree]

    yield tree.value
    while (queue.length > 0) {
        const { children } = queue.shift()!
        for (const child of children) {
            yield child.value
            queue.push(child)
        }
    }
}

function unfoldForest<T>(unf: (x: T) => Iterable<T>, x: T): Seq<Tree<T>> {
    return new Seq(unf(x)).map(y => Tree.unfold(unf, y))
}

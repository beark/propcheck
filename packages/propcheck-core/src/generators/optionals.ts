import Gen from "../Gen"

export function optional<T>(g: Gen<T>): Gen<T | undefined> {
    return Gen.sequence(Gen.const(undefined), g)
}

export function nullable<T>(g: Gen<T>): Gen<T | null> {
    return Gen.sequence(Gen.const(null), g)
}

export function optionalNullable<T>(g: Gen<T>): Gen<T | undefined | null> {
    return Gen.sequence(Gen.const(undefined), Gen.const(null), g)
}

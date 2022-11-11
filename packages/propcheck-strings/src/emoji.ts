import { Gen, Generators, Range } from "@propcheck/core"

export const unicode8Emoji: Gen<string> = Generators.integral_(
    new Range(0x1f600, 0x1f64f, 0),
).map(String.fromCodePoint)

export const unicode8EmojiTextStyle: Gen<string> = unicode8Emoji.map(
    emo => emo + String.fromCodePoint(0xfe0e),
)

export const unicode8EmojiWithStyle: Gen<string> = unicode8Emoji.andThen(emo =>
    Generators.oneOf_(
        Gen.const(String.fromCodePoint(0xfe0e)),
        Gen.const(String.fromCodePoint(0xfe0f)),
    ).map(modifier => emo + modifier),
)

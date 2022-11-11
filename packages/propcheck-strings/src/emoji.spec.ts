import { Generators, Prng } from "@propcheck/core"
import { unicode8Emoji } from "./emoji"

describe("blah", () => {
    it("blabla", () => {
        const g = Generators.string(unicode8Emoji)

        const emojiString = g.run(10, Prng.makeSeedState("hello"), 1).value
        console.log({ emojiString })
    })
})

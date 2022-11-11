import { Gen, Generators, Range } from "@propcheck/core"

export const adversarialString = (gen: Gen<string>): Gen<string> =>
    Gen.sequence(
        Gen.const(""),
        gen.andThen(str =>
            Generators.nat.andThen(n =>
                Generators.integral_(
                    new Range(0, maliciousCharacters.length, 0),
                )
                    .repeat(n / 4)
                    .andThen(ms =>
                        Generators.integral_(new Range(0, str.length - 1, 0))
                            .repeat(n / 4)
                            .map(is => {
                                let replaced = ""
                                zip(ms, is).forEach(([m, i]) => {
                                    replaced +=
                                        str.substr(0, i) +
                                        maliciousCharacters[m] +
                                        str.substr(i + 1)
                                })
                                return replaced
                            }),
                    ),
            ),
        ),
    )

const maliciousCharacters = ["\0"]
const zip = <T, U>(a: T[], b: U[]) => a.map((v, i) => [v, b[i]] as [T, U])

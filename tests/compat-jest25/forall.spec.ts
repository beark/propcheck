import { Gen } from "@propcheck/core";

describe("Jest 25", () => {
  describe("forall", () => {
    it("should pass as expected", () => {
      expect((x: number) => x === 0).forall(Gen.const(0));
    });

    it("should fail as expected", () => {
      expect(() =>
        expect((x: number) => x !== 0).forall(Gen.const(0))
      ).toThrowError(/failed after 1 iteration/);
    });
  });

  describe("forallWithOptions", () => {
    it("should pass as expected", () => {
      expect((x: number) => x === 0).forallWithOptions({}, Gen.const(0));
    });

    it("should fail as expected", () => {
      expect(() =>
        expect((x: number) => x !== 0).forallWithOptions({}, Gen.const(0))
      ).toThrowError(/failed after 1 iteration/);
    });
  });
});

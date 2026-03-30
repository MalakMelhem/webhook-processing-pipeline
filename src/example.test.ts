import { describe, it, expect } from "vitest";
import { filterData, transformData } from "../src/actions.js";

describe("filterData", () => {
  it("should remove user's age", () => {
    const input = {
      name: "malak",
      age: 30,
      score: 80,
    };

    const result = filterData(input);
    expect(result).toStrictEqual({ name: "malak", score: 80 });
  });
});

describe("transformData", () => {
  it("should transform name to username", () => {
    const input = {
      name: "malak",
      score: 80,
    };

    const result = transformData(input);
    expect(result).toStrictEqual({ username: "malak", score: 80 });
  });
});

import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("csv", () => {
  it("usa ; y escapa comillas", () => {
    expect(toCsv(["a", "b"], [[1, 'x"y']])).toBe('a;b\r\n1;"x""y"');
  });
  it("neutraliza fórmulas pero conserva negativos", () => {
    expect(toCsv(["a"], [["=HYPERLINK()"], ["-12.5"]])).toBe("a\r\n'=HYPERLINK()\r\n-12.5");
  });
});

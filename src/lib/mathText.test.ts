import assert from "node:assert/strict"
import test from "node:test"
import { hasMath, splitMath } from "./mathText.ts"

// String.raw keeps LaTeX backslashes exactly as they appear in the question files.
test("inline and display formulas are separated from text", () => {
  assert.deepEqual(splitMath("Solve $x^2 - 5x + 6 = 0$ now"), [
    { type: "text", value: "Solve " }, { type: "math", value: "x^2 - 5x + 6 = 0", display: false }, { type: "text", value: " now" },
  ])
  assert.deepEqual(splitMath(String.raw`$$\frac{a}{b}$$`), [{ type: "math", value: String.raw`\frac{a}{b}`, display: true }])
})

test("prices and literal dollars stay text", () => {
  assert.equal(hasMath("It costs $5 and $10 in total."), false)
  assert.equal(hasMath("Pay $ 20 now"), false)
  assert.deepEqual(splitMath(String.raw`Price \$5`), [{ type: "text", value: "Price $5" }])
  assert.equal(hasMath("Profit was $500"), false, "unclosed dollar")
})

test("real question bank formulas are recognised", () => {
  const set = String.raw`Given $T = \{\text{even numbers from 1 to 12}\}$, find $T \cap N$`
  assert.deepEqual(splitMath(set).filter((s) => s.type === "math").map((s) => s.value), [String.raw`T = \{\text{even numbers from 1 to 12}\}`, String.raw`T \cap N`])
  assert.equal(hasMath("$4x^3 - 8x^2 + 5x - 3$"), true)
})

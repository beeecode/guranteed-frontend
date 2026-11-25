import test from "node:test"
import assert from "node:assert/strict"
import { buildResultSheetHtml } from "./resultSheet.ts"

const sheet = (rows: Parameters<typeof buildResultSheetHtml>[0]["rows"]) => buildResultSheetHtml({
  student: { name: "Ada <b>Obi</b>", studentId: "SS1-1001", className: "Senior Secondary 1" },
  rows,
  scope: "All submitted exams",
}, "https://school.example/logo.png", new Date("2026-11-25T10:00:00Z"))

test("result sheet prints the server's figures, escapes names and marks provisional results", () => {
  const html = sheet([
    { title: "First term", subject: "Mathematics", bundle: "Mock Day", date: "2026-11-24T09:00:00Z", score: 15, max: 20, percentage: 75, passed: true, status: "released" },
    { title: "English test", subject: "English", date: "2026-11-24T10:00:00Z", score: 8, max: 20, percentage: 40, passed: null, status: "provisional" },
    { title: "Essay", subject: "Literature", date: null, score: null, max: 30, percentage: null, passed: null, status: "marking" },
  ])
  assert.ok(html.includes("Ada &lt;b&gt;Obi&lt;/b&gt;"), "student name is escaped")
  assert.ok(!html.includes("<b>Obi</b>"))
  assert.ok(html.includes("15 / 20") && html.includes("75%"))
  assert.ok(html.includes("Provisional*") && html.includes("Being marked"))
  // Average of the two marked exams (75 and 40), the one being marked is left out.
  assert.ok(html.includes("57.5%"))
  assert.ok(html.includes("<th>Result</th>") && html.includes(">Pass<"), "pass column only because the server decided one")
  assert.ok(html.includes("https://school.example/logo.png"))
})

test("no pass column and no provisional note when the server gave none", () => {
  const html = sheet([{ title: "Quiz", subject: "Maths", date: null, score: 5, max: 10, percentage: 50, passed: null, status: "released" }])
  assert.ok(!html.includes("<th>Result</th>"))
  assert.ok(!html.includes("Provisional:"))
  assert.ok(!/Grade|grade/.test(html), "no invented grade")
})

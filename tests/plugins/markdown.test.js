//Tests for markdown template rendering
const esm = require("./esm")

describe("Markdown template", () => {
  test("data printed by partials and templates is never run as template code", () => {
    const {rss, posts, field, control} = esm("markdown.mjs", "injection")
    expect(control.executed).toBe(0)
    for (const result of [rss, posts, field])
      expect(result.executed).toBe(0)
    expect(rss.rendered).toContain("RSS {% globalThis.__marker")
    expect(posts.rendered).toContain("POST {% globalThis.__marker")
    expect(field.rendered).toContain("FIELD {% globalThis.__marker")
  })

  test("both syntaxes still render", () => {
    const rendered = esm("markdown.mjs", "syntax")
    expect(rendered.sugar).toBe("a 2 b &lt;i&gt;\n")
    expect(rendered.escaped).toBe("&lt;b&gt;&amp; | <b>& | &lt;b&gt; | <b>\n")
    expect(rendered.loops).toBe("[1][2][3][4]\n")
    expect(rendered.trimming).toBe("a\nb\nc x d\n")
    expect(rendered.comments).toBe("one two three\n")
    expect(rendered.literal).toBe("<% literal %> {{tight}} {text}\n")
    expect(rendered.string).toBe("{{ x }}|{%= 1 %}\n")
    expect(rendered.include).toMatch(/^1\n\*\*\[.*Rss feed.*\n\* \[Title\]\(https:\/\/example.invalid\/1\)\n.*\n\n2\n$/s)
  })

  test("escaped brace tags stay literal and are not run", () => {
    const {literal, marked, executed} = esm("markdown.mjs", "escapes")
    expect(literal).toBe("{% literal %}\n")
    expect(marked).toBe("{% globalThis.__marker = 1 %} and {% x %} then %}\n")
    expect(executed).toBe(0)
  })

  test("delimiters that are never closed are translated in linear time", () => {
    const result = esm("markdown.mjs", "unclosed")
    for (const name of ["code", "block", "expression"]) {
      expect(result[name].same).toBe(true)
      expect(result[name].milliseconds).toBeLessThan(1000)
    }
  })
})

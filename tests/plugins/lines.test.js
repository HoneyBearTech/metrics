//Tests for the lines template (renders the real partial from disk)
const ejs = require("ejs")
const path = require("path")
const fs = require("fs")

describe("Lines template", () => {
  const template = fs.readFileSync(path.join(__dirname, "../../source/templates/classic/partials/lines.ejs"), "utf8")

  test("Renders the error message when plugins.lines.error is present", async () => {
    const rendered = await ejs.render(template, {plugins: {lines: {error: {message: "Failed to compute lines"}}}})
    expect(rendered).toContain("Lines of code pushed")
    expect(rendered).toContain("Failed to compute lines")
  })

  test("Renders repositories when sections are defined", async () => {
    const rendered = await ejs.render(template, {
      f: n => String(n),
      plugins: {lines: {sections: ["repositories"], repos: [{handle: "owner/repo", added: 100, deleted: 20, changed: 0}]}},
    })
    expect(rendered).toContain("Lines of code pushed")
    expect(rendered).toContain("owner/repo")
  })

  test("Renders nothing when sections include neither history nor repositories", async () => {
    const rendered = await ejs.render(template, {plugins: {lines: {sections: ["base"]}}})
    expect(rendered.trim()).toBe("")
  })

  test("Renders nothing without crashing when sections is undefined", async () => {
    const rendered = await ejs.render(template, {plugins: {lines: {}}})
    expect(rendered.trim()).toBe("")
  })
})

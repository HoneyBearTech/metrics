//Run an exported function of an ES module scenario in a separate node process (tests are run as commonjs) and return its JSON result
const processes = require("child_process")
const path = require("path")
const url = require("url")

//Native image module is only needed for rendering, it is stubbed when it was not built (e.g. dependencies installed with --ignore-scripts)
const loader = `
import { createRequire, registerHooks } from "node:module"
const [scenario, name] = process.argv.slice(1)
try {
  createRequire(scenario)("sharp")
}
catch {
  registerHooks({resolve: (specifier, context, next) => specifier === "sharp" ? {url: "data:text/javascript,export default function sharp() {}", shortCircuit: true} : next(specifier, context)})
}
console.debug = () => null
const result = await (await import(scenario))[name]()
process.stdout.write(\`\\n\${JSON.stringify(result)}\`)
`

module.exports = function esm(file, name) {
  const scenario = url.pathToFileURL(path.join(__dirname, "scenarios", file)).href
  const {status, stdout, stderr} = processes.spawnSync(process.execPath, ["--input-type=module", "--eval", loader, scenario, name], {cwd: path.join(__dirname, "../.."), encoding: "utf8"})
  if (status !== 0)
    throw new Error(`${file} > ${name} failed:\n${stderr}`)
  return JSON.parse(stdout.trim().split("\n").pop())
}

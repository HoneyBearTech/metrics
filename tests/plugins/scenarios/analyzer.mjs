//Imports
import fs from "fs"
import os from "os"
import paths from "path"
import { Analyzer } from "../../../source/plugins/languages/analyzer/analyzer.mjs"
import { IndepthAnalyzer } from "../../../source/plugins/languages/analyzer/indepth.mjs"

/**Run the signing keys import with a fake shell and two fake keys */
async function gpg({fail}) {
  delete process.env.GITHUB_ACTIONS
  const seen = []
  const shell = {
    run: async command => {
      const file = command.split(" ").pop()
      const dir = paths.dirname(file)
      seen.push({command, file, dir, tmpdir: os.tmpdir(), exists: fs.existsSync(file), content: fs.readFileSync(file, "utf8"), mode: fs.statSync(dir).mode & 0o777})
      if (fail)
        throw new Error("shell failure")
    },
  }
  const keys = [{key_id: "1A2B3C4D", raw_key: "key-a", emails: []}, {key_id: "5E6F7A8B", raw_key: "key-b", emails: []}]
  const rest = {users: {listGpgKeysForUser: async () => ({data: keys})}}
  const analyzer = new IndepthAnalyzer("octocat", {shell, rest})
  analyzer.debug = () => null
  await analyzer.gpgarmor()
  return {seen, remaining: seen.map(({dir}) => fs.existsSync(dir)), posix: process.platform !== "win32"}
}

/**Keys import, with a working shell */
export const gpgOk = () => gpg({fail: false})

/**Keys import, with a failing shell */
export const gpgFail = () => gpg({fail: true})

/**No keys: no folder is created */
export async function gpgNone() {
  const before = fs.readdirSync(os.tmpdir()).filter(name => name.startsWith("metrics-gpg-")).length
  const analyzer = new IndepthAnalyzer("octocat", {shell: {run: async () => null}, rest: {users: {listGpgKeysForUser: async () => ({data: []})}}})
  analyzer.debug = () => null
  await analyzer.gpgarmor()
  const after = fs.readdirSync(os.tmpdir()).filter(name => name.startsWith("metrics-gpg-")).length
  return {before, after}
}

/**Default and given ids */
export function uid() {
  const options = {shell: null}
  return {first: new Analyzer("octocat", options).uid, second: new Analyzer("octocat", options).uid, given: new Analyzer("octocat", {...options, uid: "fixed"}).uid}
}

//Imports
import fs from "node:fs"
import { svg } from "../../../source/app/metrics/utils.mjs"

//Render through svg.pdf() and describe the result
async function describe(rendered) {
  const {rendered: pdf, mime} = await svg.pdf(rendered, {paddings: "10px"})
  return {buffer: Buffer.isBuffer(pdf), header: Buffer.from(pdf).subarray(0, 4).toString("latin1"), mime}
}

//Stand-in browser whose pdf() returns plain bytes (not a Buffer), as puppeteer 25 does
export async function plain_bytes() {
  const calls = {closed: 0}
  const bytes = new Uint8Array(Buffer.from("%PDF-1.4 test"))
  const page = {
    on: () => page,
    setContent: async () => null,
    addStyleTag: async () => null,
    pdf: async () => bytes,
    close: async () => {
      calls.closed++
    },
  }
  svg.resize.browser = {newPage: async () => page}
  try {
    return {...(await describe("# Title")), plain: !Buffer.isBuffer(bytes), ...calls}
  }
  finally {
    svg.resize.browser = null
  }
}

//Real browser, only when its path is configured and exists
export async function real() {
  const path = process.env.PUPPETEER_BROWSER_PATH
  if ((!path) || (!fs.existsSync(path)))
    return {skipped: true}
  svg.resize.browser = null
  try {
    return {...(await describe("# Title\n\nSome *markdown* text")), opened: !!svg.resize.browser}
  }
  finally {
    await svg.resize.browser?.close()
    svg.resize.browser = null
  }
}

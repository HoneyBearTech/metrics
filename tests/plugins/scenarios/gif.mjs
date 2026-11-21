//Imports
import sharp from "sharp"
import { gif } from "../../../source/app/metrics/utils.mjs"

//Solid color png frames
async function frames(width, height) {
  return Promise.all([[255, 0, 0], [0, 255, 0], [0, 0, 255]].map(([r, g, b]) => sharp({create: {width, height, channels: 3, background: {r, g, b}}}).png().toBuffer()))
}

//Create a gif from a stand-in page that returns the given frames, and describe the result
async function create({size, options = {}, fail = false}) {
  const images = await frames(...size)
  let i = 0
  const page = {screenshot: async () => {
    if (fail)
      throw new Error("screenshot failed")
    return images[i++]
  }}
  const result = await gif({page, width: 40, height: 30, frames: 3, ...options})
  const prefix = "data:image/gif;base64,"
  if (!result.startsWith(prefix))
    return {result}
  const {pages, width, height, pageHeight, loop, delay} = await sharp(Buffer.from(result.slice(prefix.length), "base64"), {animated: true}).metadata()
  return {result: prefix, pages, width, height, pageHeight, loop, delay}
}

export const normal = () => create({size: [40, 30]})
export const once = () => create({size: [40, 30], options: {repeat: false}})
export const slow = () => create({size: [40, 30], options: {delay: 300, quality: 30}})
export const scaled = () => create({size: [80, 60]})
export const failing = async () => ({result: (await create({size: [40, 30], fail: true})).result})

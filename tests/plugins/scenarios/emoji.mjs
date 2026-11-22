//Imports
import axios from "axios"
import { svg } from "../../../source/app/metrics/utils.mjs"

//Render text through svg.twemojis() with the image download replaced by a small fixed image
export async function images() {
  const requested = []
  const original = axios.get
  axios.get = async url => {
    if (!url)
      throw new TypeError("Invalid URL")
    requested.push(url)
    return {data: '<svg viewBox="0 0 1 1"></svg>'}
  }
  console.debug = () => null
  try {
    const victory = "✌️"
    const check = "✔"
    const face = "\u{1F600}"
    const text = `${victory} ${check} ${face}`
    const rendered = await svg.twemojis(text, {custom: false})
    return {rendered, requested: requested.length, victory: rendered.includes(victory), check: rendered.includes(check), face: rendered.includes(face), image: rendered.includes('<svg class="twemoji" viewBox="0 0 1 1"></svg>')}
  }
  finally {
    axios.get = original
  }
}

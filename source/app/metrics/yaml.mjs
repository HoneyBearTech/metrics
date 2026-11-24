//Imports
import * as yaml from "js-yaml"

/**Schema with the types read by default before js-yaml 5 (merge keys, dates, binary data, pairs and sets; the rare ordered maps are not read). It has no custom or code types */
export const schema = yaml.CORE_SCHEMA.withTags(yaml.mergeTag, yaml.timestampTag, yaml.binaryTag, yaml.pairsTag, yaml.setTag)

/**Load one YAML document. Empty text gives undefined (and not an error), as before js-yaml 5 */
export function load(text, options) {
  const documents = yaml.loadAll(text, options)
  if (documents.length > 1)
    throw new Error("expected a single document in the stream, but found more")
  return documents[0]
}

/**Fold long lines in block text (after the rules that quote invisible characters and whitespace), even when they have no spaces (like links), as before js-yaml 5 */
function foldLong(layout) {
  const width = layout.presenterOptions.lineWidth
  const foldable = Math.floor(layout.allowedStylesMask / 2 ** yaml.SCALAR_STYLE.FOLDED_BLOCK) % 2 === 1
  if ((layout.style === yaml.SCALAR_STYLE.PLAIN) && (!layout.isKey) && (foldable) && (width !== -1) && (layout.node.value.length > Math.max(Math.min(width, 40), width - layout.shiftOfContent)) && (!layout.node.value.includes("\n")))
    layout.style = yaml.SCALAR_STYLE.FOLDED_BLOCK
}

/**Quote text made only of whitespace like before js-yaml 5 (single quotes unless the style is double). It runs after the rule for tabs and invisible characters */
function quoteBlank(layout) {
  if ((layout.style === yaml.SCALAR_STYLE.PLAIN) && (/^\s+$/.test(layout.node.value)) && (layout.presenterOptions.quoteStyle !== "double"))
    layout.style = yaml.SCALAR_STYLE.SINGLE_QUOTED
}

/**Options to write YAML as before js-yaml 5 (compatibility quoting is kept) */
export const dumpOptions = {
  scalarStyleRules: Object.entries(yaml.DEFAULT_SCALAR_STYLE_RULES).flatMap(([name, rule]) => name === "doubleQuoteWhitespaceOnly" ? [quoteBlank, rule] : name === "tryLongOrMultilineAsBlock" ? [foldLong, rule] : [rule]),
}

/**Options to write YAML as before js-yaml 5, with double quotes and without compatibility quoting */
export const dumpOptionsPlain = {...dumpOptions, quoteStyle: "double", schema}

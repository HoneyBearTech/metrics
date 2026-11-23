/**Check a rendered SVG with the XML checker (libxmljs2), which is optional.
 * When the checker is installed, a malformed picture throws. When it is missing, the check is skipped with a note.
 * It lives in its own small file so tests can call it without rendering a whole picture.
 */
export default function verify(rendered, libxmljs, login = "") {
  if (!libxmljs) {
    console.debug(`metrics/compute/${login} > XML checker not available, skipping SVG verification`)
    return
  }
  //The checker either throws or lists the errors, depending on how bad they are
  let errors = []
  try {
    ;({errors} = libxmljs.parseXml(rendered))
  }
  catch (error) {
    errors = [error]
  }
  if (errors.length)
    throw new Error(`Malformed SVG : \n${errors.join("\n")}`)
  console.debug(`metrics/compute/${login} > verified SVG, no parsing errors found`)
}

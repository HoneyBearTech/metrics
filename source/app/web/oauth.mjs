/**Keep a return address only if it is an http(s) address on the same site as the sign-in address (a full address or a path) */
export function sameSite(from, base) {
  if ((typeof from !== "string") || (!from) || (typeof base !== "string"))
    return null
  try {
    const {origin} = new URL(base)
    const target = new URL(from, origin)
    if ((!["http:", "https:"].includes(target.protocol)) || (target.origin !== origin))
      return null
    return target.href
  }
  catch {
    return null
  }
}

//Imports
import { sameSite } from "../../../source/app/web/oauth.mjs"

/**Return address check, with the sign-in address written in different ways */
export function check() {
  const kept = {
    full: sameSite("https://metrics.example.com/insights/someone?x=1", "https://metrics.example.com"),
    path: sameSite("/insights/someone", "https://metrics.example.com"),
    slash: sameSite("/insights/someone", "https://metrics.example.com/"),
    "sub path": sameSite("/insights/someone", "https://metrics.example.com/sub"),
    "full address": sameSite("https://metrics.example.com/insights/someone", "https://metrics.example.com/sub"),
  }
  const base = "https://metrics.example.com/sub"
  const dropped = {
    other: sameSite("https://other.site/x", base),
    port: sameSite("https://metrics.example.com:8443/", base),
    insecure: sameSite("http://metrics.example.com/", base),
    script: sameSite("javascript:alert(1)", base),
    upper: sameSite("JavaScript:alert(1)", base),
    relative: sameSite("//other.site", base),
    backslash: sameSite("/\\other.site", base),
    missing: sameSite(null, base),
    empty: sameSite("", base),
    nonsense: sameSite("http://", base),
    "no base": sameSite("/insights/someone", undefined),
    "bad base": sameSite("/insights/someone", "not an address"),
  }
  return {kept, dropped}
}

/**Ask the sandbox web server for two cache reset passwords */
export async function uncache() {
  process.env.METRICS_SANDBOX_PORT = "3917"
  const app = (await import("../../../source/app/web/instance.mjs")).default
  await app({sandbox: true})
  const tokens = []
  for (let i = 0; i < 2; i++)
    tokens.push((await (await fetch("http://127.0.0.1:3917/.uncache?user=someone")).json()).token)
  //The server keeps listening, so stop the process once the result is written
  setTimeout(() => process.exit(0), 500)
  return {tokens}
}

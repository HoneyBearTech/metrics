//Imports
import { formatters } from "../../../source/app/metrics/utils.mjs"
import pagespeed from "../../../source/plugins/pagespeed/index.mjs"

//Run the plugin with fake imports (no network access, `imports.url` is left out on purpose)
async function run(url) {
  const requests = []
  const category = {score: 0.9, title: "Category"}
  const imports = {
    metadata: {plugins: {pagespeed: {enabled: () => true, inputs: () => ({detailed: false, screenshot: false, url, pwa: false}), extras: () => false}}},
    axios: {
      async get(address) {
        requests.push(address)
        return {status: 200, data: {lighthouseResult: {categories: {performance: category, accessibility: category, "best-practices": category, seo: category}}}}
      },
    },
    format: formatters().format,
  }
  try {
    const result = await pagespeed({login: "user", imports, data: {}, q: {pagespeed: true}, account: "user"}, {enabled: true})
    return {result, requests}
  }
  catch (error) {
    return {error: error?.error?.message ?? String(error), requests}
  }
}

/**An address without protocol gets https:// added */
export function no_protocol() {
  return run("example.com/blog")
}

/**An address with protocol, port and path keeps its port in the result and is sent unchanged */
export function port_and_path() {
  return run("https://example.com:8443/some/path?a=b c")
}

/**An address that cannot be read ends in the plugin error */
export function invalid_address() {
  return run("https://")
}

//Tests for the browsers started by plugins, which must be closed whether the work succeeds or fails
const esm = require("./esm")

const unexpected = "Unexpected error"

describe("Browsers started by plugins", () => {
  describe("achievements", () => {
    test("closes the browser once after filling the totals", () => {
      const {error, reason, launched, closed} = esm("browsers.mjs", "achievements_success")
      expect(launched).toBe(1)
      expect(closed).toBe(1)
      //Totals were found, so the plugin went on until the account step, which is not configured here
      expect(error).toBe(unexpected)
      expect(reason).toBe("compute[account] is not a function")
    })

    test("closes the browser once when a page step throws", () => {
      const {error, reason, launched, closed} = esm("browsers.mjs", "achievements_failing")
      expect(launched).toBe(1)
      expect(closed).toBe(1)
      expect(error).toBe(unexpected)
      expect(reason).toBe("Failed to initiate total for achievement plugin")
    })

    test("keeps the outcome when closing the browser fails", () => {
      const {error, reason, closed} = esm("browsers.mjs", "achievements_close_error")
      expect(closed).toBe(1)
      expect(error).toBe(unexpected)
      expect(reason).toBe("compute[account] is not a function")
    })
  })

  describe("music", () => {
    const tracks = [{name: "Track", artist: "Artist", artwork: "https://example.com/a.png"}]

    test("closes the browser once after reading a playlist", () => {
      const {result, error, launched, closed} = esm("browsers.mjs", "music_success")
      expect(launched).toBe(1)
      expect(closed).toBe(1)
      expect(error).toBeUndefined()
      expect(result).toEqual({provider: "Spotify", mode: "Suggested tracks", tracks})
    })

    test("closes the browser once when a page step throws", () => {
      const {result, error, reason, launched, closed} = esm("browsers.mjs", "music_failing")
      expect(launched).toBe(1)
      expect(closed).toBe(1)
      expect(result).toBeUndefined()
      expect(error).toBe(unexpected)
      expect(reason).toBe("waitForSelector failed")
    })

    test("keeps the result when closing the browser fails", () => {
      const {result, closed} = esm("browsers.mjs", "music_close_error")
      expect(closed).toBe(1)
      expect(result).toEqual({provider: "Spotify", mode: "Suggested tracks", tracks})
    })
  })

  describe("topics", () => {
    const list = [{name: "javascript", description: "JS", icon: null, url: "https://github.com/topics/javascript"}]

    test("closes the browser once after listing topics", () => {
      const {result, error, launched, closed} = esm("browsers.mjs", "topics_success")
      expect(launched).toBe(1)
      expect(closed).toBe(1)
      expect(error).toBeUndefined()
      expect(result).toEqual({mode: "labels", type: "labels", list})
    })

    test("closes the browser once when a page step throws", () => {
      const {result, error, reason, launched, closed} = esm("browsers.mjs", "topics_failing")
      expect(launched).toBe(1)
      expect(closed).toBe(1)
      expect(result).toBeUndefined()
      expect(error).toBe(unexpected)
      expect(reason).toBe("goto failed")
    })

    test("keeps the result when closing the browser fails", () => {
      const {result, closed} = esm("browsers.mjs", "topics_close_error")
      expect(closed).toBe(1)
      expect(result).toEqual({mode: "labels", type: "labels", list})
    })
  })
})

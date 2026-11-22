# Plan: plugin-token-extras

**What Sean asked for:** "keep going", after the extras fix. This is one of the follow-ups it found (roadmap: "Token options that aren't checked").

## What we found

- **Four options declare a feature that is never checked:** `plugin_steam_token` (`metrics.api.steam`), `plugin_chess_token` (`metrics.api.chess.any`), `plugin_splatoon_token` (`metrics.api.nintendo.splatnet`) and `plugin_splatoon_statink` (`metrics.api.statink`). Their plugins never check them. A scan of every plugin found no others; the other 24 options that need a feature are checked.
- **What the features protect:** they're a web server owner's switch for letting visitors use the owner's own keys for those outside services. The tokens come from the server's settings, not from the request. Today, a server that turns on one of these plugins and sets its token lets every visitor use it without the feature. For stat.ink, a visitor's request also makes the server upload data with the owner's key.
- **Not on a default server:** these plugins are off by default on a web server. The Action allows every feature, so it is unchanged.

## What we'll change

1. **Check the features in the three plugins:** `source/plugins/steam/index.mjs`, `source/plugins/community/chess/index.mjs` and `source/plugins/community/splatoon/index.mjs` check each option's feature right after reading their inputs, the same way other plugins check theirs. A refused request gets the usual "Option ... is disabled on this server" error.
   - *Check:* without the feature nothing is sent to the outside service. With the feature, or all features, it works.
2. **Tests in `tests/plugins/`:**
   - **One for each fixed option**, with stand-ins for the outside services.
   - **A test that reads every plugin's options:** it fails if an option declares a feature its plugin never checks, so this can't come back.
   - *Check:* the tests fail on today's code.
3. **Prove nothing broke:** lint, build, the focused tests and CI's full suite.

## Who's on it

Researcher (done), Engineer, Security Officer, Auditor. A small change, so no separate QA.

## Risks

- **Breaking change for some web servers:** a web server that turned on steam, chess or splatoon with a token, but not the matching feature, gets an error from those plugins until its owner turns the feature on. That matches what the docs already say.

## Out of scope

- The web server's two form checks for the feature list (#120).

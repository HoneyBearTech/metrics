# Plan: extras-permissions

**What Sean asked for:** "start the extras fix" (the roadmap items "Extra CSS and JavaScript on the web server" and "Old extras flags change shared settings").

## What we found

- **The check finds nothing for core options:** the permission check for the core options looks up the wrong name, so it never finds their required feature and always says yes. This affects `extras.css`, `extras.js` and `verify` on any web server, whatever its settings say. Plugin options are checked correctly.
- **What a request can do today:** with the default or minimal settings, a request's own CSS goes into the image, and its own JavaScript runs in the server's browser while the image is rendered. This was shown with harmless markers. That browser can make requests from the server's network.
- **Old flags pile up:** the old `extras.css`, `extras.js` and `extras.presets` flags add their feature to the server's shared list every time the check runs, so it grows for later requests.
- **The Action isn't affected:** it allows every extra feature on purpose.

## What we'll change

1. **Find the core options' requirements (`source/app/metrics/metadata.mjs`):** the name the check looks up is built without the plugin prefix for core options, so their `extras:` requirements are found.
   - *Check:* without the matching feature, `extras.css`, `extras.js` and `verify` are refused. With it, or with all features on, they're allowed. Plugin options behave as before.
2. **Leave the shared list alone:** the old flags add their feature to a copy for that one check, never to the server's shared list.
3. **Tests in `tests/plugins/`:**
   - every guarded core option without and with its feature;
   - the old flags;
   - the shared list stays unchanged;
   - a render with stand-in data in which a request's CSS and JavaScript are left out without the feature and used with it.
   - *Check:* the tests fail on today's code.
4. **Docs:** the extra features table in the web setup docs, the comments in the example settings and `docs/security.md` say that a request's CSS and JavaScript need their features, and that the JavaScript runs in the server's browser.
5. **Prove nothing broke:** lint, build, the focused tests and CI's full suite.

## Who's on it

Researcher (done), Engineer, QA, Security Officer, Auditor.

## Risks

- **Breaking change for some web servers:** a web server whose visitors use `extras.css` or `extras.js` without the server turning on their features loses them. That's on purpose: the docs already say they need the features.

## Out of scope (next jobs)

- **The SVG check is written backwards** (`verify`).
- **Token options that aren't checked:** some plugins' token options declare a required feature that nothing checks.
- **A crash for logged-in users:** the `/.extras` page can crash for a logged-in user when the server's feature list is unset.

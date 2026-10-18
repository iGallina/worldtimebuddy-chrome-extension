# worldtimebuddy-chrome-extension — notes

The popup frames the real https://www.worldtimebuddy.com/ (zoomed to 75.5% to fit Chrome's 800px popup cap, with side margins so the per-row remove/home buttons show) and
slims it: no logo, site nav, footer, about text, ads or feedback tab. Account menu, am/pm/24/MX, tabs, toolbar
and rows stay. Dark mode follows macOS: the page is inverted, images, hour tiles and selection bands are flipped back; tiles get a dark palette that keeps night/day/work-hour order. Nothing about the site is reimplemented, so every feature is the site's own.

| File | Why |
|---|---|
| `popup.html` / `popup.js` | Frames the site; sizes the popup to the height `slim.js` reports. |
| `slim.js` / `slim.css` | Hide chrome only when framed by this extension (`html.wtb-ext`); normal tabs untouched. |
| `cookie-fix.js` (MAIN world) | Framed JS may only *write* cookies marked `SameSite=None; Secure`; the site's startup cookie check otherwise throws and aborts init (search stuck on "Loading …", no date picker). |
| `background.js` | Framed JS can only *read* `SameSite=None` cookies; the server sets `Lax` ones. Unseen, adding a city saved only that city. Re-marks the site's `www.worldtimebuddy.com` cookies `None; Secure`; the popup loads the site only after that. |

Side effect: the site's own cookies stay `SameSite=None` in normal tabs too (sent on cross-site requests).

## How the site works (REA + Playwright, 2026-10-17, logged out)

Server-rendered (jQuery 1.4.2, `media/js/scripts.js`). No list API: the server renders the list into `/` from cookies.
No X-Frame-Options/CSP frame-ancestors, no frame-busting, no `target="_top"`.

| Action | Request | Cookie |
|---|---|---|
| Search place | `GET /helper/locations?q=…` → `[{text, id}]` (GeoNames id) | — |
| Add / remove / set home / sort / reorder | full reload of `/` | `hka_lid`, `hka_home` |
| am-pm / 24 / MX | `GET /helper/hour_format/{24,mx}` → `/` | `hka_ap` |
| Show timezones, Mark weekends | none | `hka_tzn`, `hka_wknd` |
| Calendars… | `/calendar_settings` page | — |
| Date tabs / picker | reload `/` | — |
| Hour-tile click/drag | client-only meeting toolbar (iCal, GCal, Gmail, clipboard, link) | — |

Account: `wtbsess` (+ encrypted `wtbsess_data`), no SameSite attribute (= Lax). Logged in, changes are saved
to the server (`window.loggedIn` → `/pingback`), plus `/helper/edit_location`, `/helper/edit_tab`,
`/helper/remove_alias` for renames. Those were read in the code, not exercised.

## Logged-in extras (read from Ian's account, 2026-10-18, no changes made)

Tab bar (`.loc-tab`, add `/helper/add_tab`, close, rename via `/helper/edit_tab`), account menu (`/account`,
`/provider/logout`), "Link to this view" (`#page-link`, `?pl=1&lid=…&h=…&hf=1`). List lives server-side, not in `hka_lid`.
The site also has an official Chrome extension: Web Store id `jdhpjomiingppeefgnohkiapmnaeakoj`.

## Known limits

- Signing in from inside the popup likely fails (Google OAuth refuses frames). Sign in once on the site in a normal tab.
- Not verified: "Link to this view" output; drag-to-reorder removed a row in one automated run.

## Test

`test/popup-test.js` loads the extension in Chrome for Testing (throwaway profile, logged out) and checks inside the
popup: no page errors, init completes, search, add city keeps the existing list, date picker, 24h, settings and list
persist after reopening. Needs `npm i playwright` and a Playwright Chromium (branded Chrome ignores
`--load-extension`). Run: `node test/popup-test.js`.

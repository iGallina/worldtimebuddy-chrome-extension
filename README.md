# World Time Buddy popup

A Chrome extension that opens [worldtimebuddy.com](https://www.worldtimebuddy.com/) in a slim toolbar popup.
It uses your existing worldtimebuddy login in Chrome, so your saved list and tabs show up without signing in again.
Dark mode follows your system setting.

Unofficial: not affiliated with or endorsed by World Time Buddy.

## Install

1. Download this repo (Code → Download ZIP) and unzip it.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick the unzipped folder.
4. Pin the extension and click its icon. Sign in on worldtimebuddy.com in a normal tab first if you want your saved list.

## Good to know

- Your worldtimebuddy cookies are switched to `SameSite=None` so the site works inside the popup (details in `NOTES.md`).
- Signing in from inside the popup doesn't work; sign in on the site itself.

## License

MIT, see [LICENSE](LICENSE).
